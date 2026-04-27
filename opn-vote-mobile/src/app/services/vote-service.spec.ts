import { webcrypto } from 'node:crypto';
import { TestBed } from '@angular/core/testing';
import { Wallet } from 'ethers';
import { hashMessage, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient } from 'viem';
import { createSmartAccountClient } from 'permissionless';
import { to7702SimpleSmartAccount } from 'permissionless/accounts';

import { UrlPaths, UrlProperties } from '../globals/url';
import { EncryptionType } from '../voting-system/encryption-type';
import { VoteOption } from '../voting-system/vote-option';
import { postJson } from '../server/postJson';
import { querySubgraph } from '../server/querySubgraph';
import type { VoterCredentials } from '../models/voter-credentials';
import { VoteService } from './vote-service';
import { graphElectionRaw17 } from './fixtures/graph-election-raw-17.fixture';

jest.mock('../server/postJson', () => ({
  postJson: jest.fn(),
}));

jest.mock('../server/querySubgraph', () => ({
  querySubgraph: jest.fn(),
}));

jest.mock('viem', () => {
  const actual = jest.requireActual<typeof import('viem')>('viem');
  return {
    ...actual,
    createPublicClient: jest.fn(),
    http: jest.fn(() => ({})),
  };
});

jest.mock('permissionless', () => {
  const actual = jest.requireActual<typeof import('permissionless')>('permissionless');
  return {
    ...actual,
    createSmartAccountClient: jest.fn(),
  };
});

jest.mock('permissionless/accounts', () => {
  const actual = jest.requireActual<typeof import('permissionless/accounts')>('permissionless/accounts');
  return {
    ...actual,
    to7702SimpleSmartAccount: jest.fn(),
  };
});

const postJsonMock = postJson as jest.MockedFunction<typeof postJson>;
const querySubgraphMock = querySubgraph as jest.MockedFunction<typeof querySubgraph>;
const createPublicClientMock = createPublicClient as jest.MockedFunction<typeof createPublicClient>;
const createSmartAccountClientMock = createSmartAccountClient as jest.MockedFunction<
  typeof createSmartAccountClient
>;
const to7702Mock = to7702SimpleSmartAccount as jest.MockedFunction<typeof to7702SimpleSmartAccount>;

/** Anvil #0 – only for tests not real secret. */
const ANVIL_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex;

function testVoterCredentials(electionId: number): VoterCredentials {
  const wallet = new Wallet(ANVIL_PRIVATE_KEY);
  return {
    electionId,
    voterWallet: wallet,
    unblindedElectionToken: {
      hexString: '0x0' + 'b'.repeat(63),
      isMaster: false,
      isBlinded: false,
    },
    unblindedSignature: {
      hexString: ('0x03' + '9'.repeat(510)) as Hex,
      isBlinded: false,
    },
    encryptionKey: {
      hexString: '0x' + '11'.repeat(32),
      encryptionType: EncryptionType.AES,
    },
  };
}

describe('VoteService', () => {
  let service: VoteService;

  beforeAll(() => {
    if (typeof window !== 'undefined' && !window.crypto?.subtle) {
      Object.defineProperty(window, 'crypto', { value: webcrypto, configurable: true });
    }
  });

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('hasExistingVote', () => {
    it('returns false when subgraph has no voteCasts', async () => {
      querySubgraphMock.mockResolvedValue({ voteCasts: [] });
      await expect(service.hasExistingVote(42, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).resolves.toBe(
        false,
      );
      expect(querySubgraphMock).toHaveBeenCalledWith(
        UrlPaths.graphUrl,
        expect.stringContaining('voteCasts(where: { electionId: "42"'),
      );
    });

    it('returns true when subgraph returns a voteCast', async () => {
      querySubgraphMock.mockResolvedValue({ voteCasts: [{ transactionHash: '0xabc' }] });
      await expect(service.hasExistingVote(1, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).resolves.toBe(
        true,
      );
    });
  });

  describe('verifyVotes', () => {
    it('resolves when voteCasts appear', async () => {
      querySubgraphMock.mockResolvedValue({ voteCasts: [{ transactionHash: '0xdead' }] });
      await expect(
        service.verifyVotes(5, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0xdead'),
      ).resolves.toBeUndefined();
    });

    it('throws after 10 empty subgraph responses', async () => {
      querySubgraphMock.mockResolvedValue({ voteCasts: [] });
      await expect(
        service.verifyVotes(5, '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', '0x'),
      ).rejects.toThrow('Vote not yet indexed after 10 attempts');
      expect(querySubgraphMock).toHaveBeenCalledTimes(10);
    });
  });

  describe('sendVotes', () => {
    const expectedTxHash = ('0x' + 'cc'.repeat(32)) as Hex;

    beforeEach(() => {
      postJsonMock.mockImplementation(async (url: string, body: unknown) => {
        const account = privateKeyToAccount(ANVIL_PRIVATE_KEY);
        if (url === `${UrlPaths.svsUrl}${UrlProperties.signVotingTransaction}`) {
          const vt = (body as { votingTransaction: unknown }).votingTransaction;
          const msgHash = hashMessage(JSON.stringify(vt));
          const sig = await account.signMessage({ message: msgHash });
          return { blindedSignature: { hexString: sig } };
        }
        if (url === `${UrlPaths.svsUrl}${UrlProperties.sponsor}`) {
          return {
            paymasterData: ('0x' + 'aa'.repeat(32)) as Hex,
            userOpParams: {
              nonce: '1',
              callGasLimit: '500000',
              verificationGasLimit: '500000',
              preVerificationGas: '50000',
              paymasterVerificationGasLimit: '1',
              paymasterPostOpGasLimit: '1',
              maxFeePerGas: '20000000000',
              maxPriorityFeePerGas: '20000000000',
            },
          };
        }
        throw new Error(`Unexpected postJson URL: ${url}`);
      });

      createPublicClientMock.mockReturnValue({
        getTransactionCount: jest.fn().mockResolvedValue(0n),
      } as unknown as ReturnType<typeof createPublicClient>);

      to7702Mock.mockResolvedValue({
        isDeployed: () => Promise.resolve(true),
      } as Awaited<ReturnType<typeof to7702SimpleSmartAccount>>);

      createSmartAccountClientMock.mockReturnValue({
        sendUserOperation: jest.fn().mockResolvedValue(('0x' + 'bb'.repeat(32)) as Hex),
        waitForUserOperationReceipt: jest.fn().mockResolvedValue({
          success: true,
          receipt: { transactionHash: expectedTxHash },
          actualGasCost: 0n,
        }),
      } as unknown as ReturnType<typeof createSmartAccountClient>);
    });

    it('calls SVS sign and sponsor, then submits userOp and returns tx hash', async () => {
      let subgraphCalls = 0;
      querySubgraphMock.mockImplementation(async () => {
        subgraphCalls += 1;
        if (subgraphCalls === 1) {
          return { voteCasts: [] };
        }
        return { voteCasts: [{ transactionHash: expectedTxHash }] };
      });

      const txHash = await service.sendVotes(
        { 0: VoteOption.Yes, 1: VoteOption.No },
        testVoterCredentials(42),
        graphElectionRaw17.publicKey,
      );

      expect(txHash).toBe(expectedTxHash);

      const signCalls = postJsonMock.mock.calls.filter(
        (c) => c[0] === `${UrlPaths.svsUrl}${UrlProperties.signVotingTransaction}`,
      );
      const sponsorCalls = postJsonMock.mock.calls.filter(
        (c) => c[0] === `${UrlPaths.svsUrl}${UrlProperties.sponsor}`,
      );
      expect(signCalls.length).toBe(1);
      expect(sponsorCalls.length).toBe(1);
      expect(signCalls[0]![1]).toMatchObject({
        votingTransaction: expect.any(Object),
        voterSignature: { hexString: expect.stringMatching(/^0x/) },
      });
      expect(sponsorCalls[0]![1]).toMatchObject({
        votingTransaction: expect.objectContaining({ svsSignature: expect.any(Object) }),
        voterSignature: { hexString: expect.stringMatching(/^0x/) },
      });

      expect(createPublicClientMock).toHaveBeenCalled();
      expect(to7702Mock).toHaveBeenCalled();
      expect(createSmartAccountClientMock).toHaveBeenCalled();
    });

    it('skips SVS sign when hasExistingVote is true (recast path)', async () => {
      querySubgraphMock.mockResolvedValue({
        voteCasts: [{ transactionHash: '0x' + 'ee'.repeat(32) }],
      });

      const txHash = await service.sendVotes(
        { 0: VoteOption.Yes, 1: VoteOption.No },
        testVoterCredentials(99),
        graphElectionRaw17.publicKey,
      );

      expect(txHash).toBe(expectedTxHash);
      const signCalls = postJsonMock.mock.calls.filter(
        (c) => c[0] === `${UrlPaths.svsUrl}${UrlProperties.signVotingTransaction}`,
      );
      expect(signCalls.length).toBe(0);
      expect(
        postJsonMock.mock.calls.some((c) => c[0] === `${UrlPaths.svsUrl}${UrlProperties.sponsor}`),
      ).toBe(true);
    });
  });
});
