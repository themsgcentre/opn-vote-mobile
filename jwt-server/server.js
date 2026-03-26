const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Buffer } = require("node:buffer");
const { createSign } = require("node:crypto");
const fs = require("node:fs");

dotenv.config({ path: "development.env" });

const app = express();
app.use(cors());
app.use(express.json());

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} fehlt in development.env`);
  }
  return value;
}

function parsePositiveInt(value, name) {
  const num = Number(value);

  if (!Number.isSafeInteger(num) || num <= 0) {
    throw new Error(`${name} muss eine positive ganze Zahl sein, bekommen: "${value}"`);
  }

  return num;
}

function loadPrivateKey() {
  if (process.env.PRIVATE_KEY) {
    return requireEnv("PRIVATE_KEY").replace(/\\n/g, "\n");
  }

  if (process.env.PRIVATE_KEY_PATH) {
    return fs.readFileSync(requireEnv("PRIVATE_KEY_PATH"), "utf8");
  }

  throw new Error("PRIVATE_KEY oder PRIVATE_KEY_PATH fehlt in development.env");
}

function createJwt(payload, rsaPrivKeyPem) {
  const b64url = (s) => Buffer.from(s).toString("base64url");
  const header = { alg: "RS256", typ: "JWT" };
  const sigInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;

  const sign = createSign("RSA-SHA256");
  sign.update(sigInput);
  sign.end();

  return `${sigInput}.${sign.sign(rsaPrivKeyPem, "base64url")}`;
}

// TODO: only for testing, replace later
function createPayload(electionId) {
  const voterId = Date.now();
  return { electionId, voterId };
}

const privateKey = loadPrivateKey();

app.post("/api/jwt", (req, res) => {
  try {
    const rawElectionId = req.body.electionId ?? process.env.ELECTION_ID;
    const electionId = parsePositiveInt(rawElectionId, "electionId");

    const jwt = createJwt(createPayload(electionId), privateKey);

    res.json({ token: jwt });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unbekannter Fehler",
    });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`JWT backend läuft auf http://localhost:${port}`);
});