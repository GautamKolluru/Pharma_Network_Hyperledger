/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict"

const { Wallets } = require("fabric-network")
const FabricCAServices = require("fabric-ca-client")
const fs = require("fs")
const path = require("path")
const yaml = require("js-yaml")

async function main() {
  try {
    // load the network configuration
    const ccpPath = path.resolve(
      __dirname,
      "..",
      "new-network",
      "organizations",
      "peerOrganizations",
      "consumer.pharma-network.com",
      "connection-consumer.json"
    )
    const ccp = JSON.parse(fs.readFileSync(ccpPath, "utf8"))

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities["ca.consumer.pharma-network"].url
    const ca = new FabricCAServices(caURL)

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "identity/consumer")
    const wallet = await Wallets.newFileSystemWallet(walletPath)
    console.log(`Wallet path: ${walletPath}`)

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get("appUser1")
    if (userIdentity) {
      console.log(
        'An identity for the user "appUser" already exists in the wallet'
      )
      return
    }

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get("admin")
    if (!adminIdentity) {
      console.log(
        'An identity for the admin user "admin" does not exist in the wallet'
      )
      console.log("Run the enrollAdmin.js application before retrying")
      return
    }

    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type)
    const adminUser = await provider.getUserContext(adminIdentity, "admin")

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register(
      {
        affiliation: "hospitalA.department1",
        enrollmentID: "appUser1",
        role: "client",
        attrs: [{ name: "isAdmin", value: "true" }],
      },
      adminUser
    )
    const enrollment = await ca.enroll({
      enrollmentID: "appUser1",
      enrollmentSecret: secret,
      attr_reqs: [{ name: "isAdmin", optional: false }],
    })
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: "ConsumerMSP",
      type: "X.509",
    }
    await wallet.put("appUser1", x509Identity)
    console.log(
      'Successfully registered and enrolled admin user "appUser" and imported it into the wallet'
    )
  } catch (error) {
    console.error(`Failed to register user "appUser": ${error}`)
    process.exit(1)
  }
}

main()
