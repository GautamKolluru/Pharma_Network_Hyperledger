"use strict"

const { Contract } = require("fabric-contract-api")

class register extends Contract {
  constructor() {
    super("org.pharma.registration")
  }

  async instantiate() {
    console.log("Gautam Registration Smart Contract Instatiate")
  }
  /**
   *
   * @param {*} ctx
   * @param {*} companyCRN
   * @param {*} companyName
   * @param {*} Location
   * @param {*} organisationRole
   * @returns
   */
  async registerCompany(
    ctx,
    companyCRN,
    companyName,
    Location,
    organisationRole
  ) {
    let companyKey = await ctx.stub.createCompositeKey("register.company", [
      companyCRN,
      companyName,
    ])
    let hierarchyKey = 0
    let companyStatus = await this.verifyCompanyRegistered(ctx, companyKey)
    if (companyStatus.msg == "Company Already Registered") {
      return companyStatus.msg
    }

    switch (organisationRole.toLowerCase()) {
      case "manufacturer":
        hierarchyKey = 1
        break
      case "distributor":
        hierarchyKey = 2
        break
      case "retailer":
        hierarchyKey = 3
        break
    }

    let data = {
      companyID: companyKey,
      companyName,
      Location,
      organisationRole,
      hierarchyKey,
    }
    let dataBuffer = Buffer.from(JSON.stringify(data))
    await ctx.stub.putState(companyKey, dataBuffer)
    return data
  }
  /**
   *
   * @param {*} ctx
   * @param {*} companyKey
   * @returns
   */
  async verifyCompanyRegistered(ctx, companyKey) {
    let value
    try {
      value = JSON.parse(await ctx.stub.getState(companyKey))
    } catch (error) {
      return { msg: "Company Not Registered" }
    }
    return { msg: "Company Already Registered" }
  }

  /**
   *
   * @param {*} ctx
   * @param {*} companyKey
   * @returns
   */
  async getRegisteredCompany(ctx, companyKey) {
    let value
    value = JSON.parse(await ctx.stub.getState(companyKey))

    return value
  }

  /**
   * Generate all the value available in iterator
   * @param iterator - iterator object
   * @returns - array of value availabe in iterator object
   */

  async getAllResults(iterator) {
    const allResults = []
    while (true) {
      const res = await iterator.next()
      //console.log(`Inside getallresulr:${JSON.stringify(res)}`)

      if (res.value) {
        allResults.push(JSON.parse(res.value.value.toString("utf8")))
      }

      // check to see if we have reached then end
      if (res.done) {
        // explicitly close the iterator
        await iterator.close()
        return allResults
      }
    }
  }

  /**
   *
   * @param {*} drugName
   * @param {*} serialNo
   * @param {*} mfgDate
   * @param {*} expDate
   * @param {*} companyCRN
   */
  async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
    console.log("MSP ID" + ctx.clientIdentity.getMSPID())

    if (ctx.clientIdentity.getMSPID() !== "ManufacturerMSP") {
      return { msg: "Only Manufacturer can Add Drug Details" }
    }
    let productCompositKey = await ctx.stub.createCompositeKey("product.id", [
      drugName,
      serialNo,
    ])
    let iter = await ctx.stub.getStateByPartialCompositeKey(
      "register.company",
      [companyCRN]
    )

    const finaldata = await this.getAllResults(iter)
    if (finaldata.length > 1) {
      return { msg: `Multiple Entry Present for companyCRN ${companyCRN}` }
    }

    console.log("Final Data" + JSON.stringify(finaldata[0]))

    let data = {
      productID: productCompositKey,
      name: drugName,
      manufacturer: finaldata[0].companyName,
      manufacturingDate: mfgDate,
      expiryDate: expDate,
      owner: finaldata[0].companyID,
      shipment: "",
    }
    let dataBuffer = Buffer.from(JSON.stringify(data))
    await ctx.stub.putState(productCompositKey, dataBuffer)
    return data
  }
}
module.exports = register
