// @ts-ignore
import * as asn1 from "asn1.js";
import dotenv from 'dotenv'
import { ethers } from 'ethers'
import {
  GetPublicKeyCommand,
  KMSClient,
} from '@aws-sdk/client-kms';
import * as path from 'path';
const ENV_PATH = path.join(__dirname, '../.env')
dotenv.config({ path: ENV_PATH })

const EcdsaPubKey = asn1.define("EcdsaPubKey", function (this: any) {
  // parsing this according to https://tools.ietf.org/html/rfc5480#section-2
  this.seq().obj(
    this.key("algo").seq().obj(this.key("a").objid(), this.key("b").objid()),
    this.key("pubKey").bitstr()
  );
});

function getEthereumAddress(publicKey: Buffer): string {
  // The public key is ASN1 encoded in a format according to
  // https://tools.ietf.org/html/rfc5480#section-2
  // I used https://lapo.it/asn1js to figure out how to parse this
  // and defined the schema in the EcdsaPubKey object
  const res = EcdsaPubKey.decode(publicKey, "der");
  let pubKeyBuffer: Buffer = res.pubKey.data;

  // The public key starts with a 0x04 prefix that needs to be removed
  // more info: https://www.oreilly.com/library/view/mastering-ethereum/9781491971932/ch04.html
  pubKeyBuffer = pubKeyBuffer.slice(1, pubKeyBuffer.length);

  const address = ethers.utils.keccak256(pubKeyBuffer); // keccak256 hash of publicKey
  const EthAddr = `0x${address.slice(-40)}`; // take last 20 bytes as ethereum adress
  return EthAddr;
}

async function fetchAddressFromAws() {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!accessKeyId) {
    throw new Error("No AWS_ACCESS_KEY_ID set")
  }

  if (!secretAccessKey) {
    throw new Error("No AWS_SECRET_ACCESS_KEY set")
  }

  const client = new KMSClient({
    region: process.env.ABC_VALIDATOR_REGION,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });

  const publicKeyResponse = await client.send(
    new GetPublicKeyCommand({ KeyId: process.env.KMS_KEY_ID }),
  );

  console.log('Address: ', getEthereumAddress(
    Buffer.from(publicKeyResponse.PublicKey!)
  ));
}

fetchAddressFromAws().catch((err) => console.log('Error!', err));
