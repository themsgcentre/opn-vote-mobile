/**
 * Rohobjekt wie vom Subgraph unter `data.election` – reine Test-/Platzhaltertexte.
 * `descriptionBlob` entspricht dem gelieferten JSON-String.
 */
export const graphElectionRaw17 = {
  id: '17',
  authorizedVoterCount: '474',
  descriptionBlob: JSON.stringify({
    title: 'Fixture-Wahl 17 (nur Testdaten)',
    headerImage: {
      large: 'https://example.com/fixtures/election-17-header-large.png',
      small: 'https://example.com/fixtures/election-17-header-small.png',
    },
    description:
      'Langer Beschreibungstext nur für Unit-Tests. Kein Bezug zu realen Kampagnen oder Inhalten.',
    summary: 'Kurzfassung: Platzhalter für Tests.',
    registrationStartTime: '1746050400',
    registrationEndTime: '1947260000',
    questions: [
      { text: 'Testfrage A – Ja/Nein?', imageUrl: 'https://example.com/fixtures/q-a.png' },
      { text: 'Testfrage B – Optionen?', imageUrl: 'https://example.com/fixtures/q-b.png' },
    ],
    backLink: 'https://example.org/fixture-backlink',
    author: 'fixture-author',
    authorWalletAddress: '0xCB3597629386f9C24C85AE3cDCb8Ec0BC6610b1E',
  }),
  descriptionIpfsCid: 'QmFixtureTestElection17DescriptionBlob',
  privateKey: null,
  publicKey:
    '0x30820122300d06092a864886f70d01010105000382010f003082010a0282010100bb1cec11000620386084725c4f2ac73dbcbb79e3b261dc7893a6a6d099de2a6dd127946e0c34d014facbe3e9bd460cfb2ba0521d0a16e75c68e1ab5e13020c264874134bbdaccd82ef67e5ac5f3b7945db3013561911382371fa072a114ca91c6b48b7c4d047fd6cab68db8f68a0fa76db151e4321e53680ceacafd02873988b53c14427c9962910712418683d022dc11331740d1874e06d8e0bd2c2be3fcad462f09db9733ea94f258ce9c3af5d64014f90633f1969dbf7b163603170667dd869a4fe1fe15debc20b8c1a0955a377a43f318d4214aa11d7ef51fee492d729fc76961aa8ff6f7ffb3a658f7b0e3ad2a62c65d8e445075c74f17384f0e76b3a930203010001',
  registerPublicKeyE: '0x010001',
  registerPublicKeyN:
    '0x8115875f3a5d3c9386bb78e1cefa26b33dabb7292aa051b368f3a32ccb22ee3797a0072aa7cda78d1609aa13471987121b501723ae080e6d89cbbdfdd56ffd077ee1097f12eb34f6a69bdaee611ef79dd1fb403a6a3f1520799814c8a0d7a8d9fd85d44aa156f056a6a8012dbfcdff5f177e25bc6991b59f9d4cc75cbaa39902f127760e5bbf687f2d93bcaf33a59b717d293c2eb3e9afd16a5641dfb4f2fe5e31ba8fd8beceb9cbec46c9ff8838f648ca31908e347c64ecbdef3a0921fd9cb6ca45e161fde10f7a3d4b06078c51f12964a9a60b253d8788404a470ecd9442110987bd83939304fdeb2a3f69986ad6a0944d569e0e8b85777ab1da139e4edc9b',
  registeredVoterCount: '594',
  registrationEndTime: '1947260000',
  registrationStartTime: '1746050400',
  status: 1,
  totalVotes: '542',
  transactionHash: '0x9ac4a6a18e3eee44dfec688c5b056f77728355eb2c13b98e436b726239a64690',
  votingEndTime: '1947260000',
  votingStartTime: '1773978205',
} as const;
