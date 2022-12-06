"use strict"

const { Contract } = require("fabric-contract-api")

class transferdrug extends Contract {
  constructor() {
    super("org.pharma.transfer")
  }

  async instantiate() {
    console.log("Transfer Drug Smart Contract Instatiate")
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
   * @param {*} ctx
   * @param {*} buyerCRN
   * @param {*} sellerCRN
   * @param {*} drugName
   * @param {*} quantity
   * @returns
   */
  async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
    console.log("MSP ID: " + ctx.clientIdentity.getMSPID())
    let authorizedParties = ["DistributorMSP", "RetailerMSP"]
    if (!authorizedParties.includes(ctx.clientIdentity.getMSPID())) {
      return { msg: "Only Distributor or Retailer Can Access This Operation" }
    }

    let buyeriter = await ctx.stub.getStateByPartialCompositeKey(
      "register.company",
      [buyerCRN]
    )

    const buyerDetails = await this.getAllResults(buyeriter)
    if (buyerDetails.length > 1 || buyerDetails.length == 0) {
      return { msg: `Entry Not Correct for companyCRN ${buyerCRN}` }
    }

    let selleriter = await ctx.stub.getStateByPartialCompositeKey(
      "register.company",
      [sellerCRN]
    )

    const sellerDetails = await this.getAllResults(selleriter)
    if (sellerDetails.length > 1 || sellerDetails.length == 0) {
      return { msg: `Entry Not Correct for companyCRN ${sellerCRN}` }
    }

    let hierarchyValue =
      buyerDetails[0].hierarchyKey - sellerDetails[0].hierarchyKey

    if (hierarchyValue > 1) {
      return {
        msg: `Retailer is able to purchase drugs only from a distributor and not from a manufacturing company.`,
      }
    }

    //Created composit key for every po
    let poKey = await ctx.stub.createCompositeKey("created.po", [
      buyerCRN,
      drugName,
    ])

    let data = {
      poID: poKey,
      drugName,
      quantity,
      buyer: buyerDetails[0].companyID,
      seller: sellerDetails[0].companyID,
      shipmentStatus: "Pending",
    }
    let dataBuffer = Buffer.from(JSON.stringify(data))
    await ctx.stub.putState(poKey, dataBuffer)
    return data
  }

  /**
   *
   * @param {*} ctx
   * @param {*} buyerCRN
   * @param {*} drugName
   * @param {*} listOfAssets
   * @param {*} transporterCRN
   * @returns
   */

  async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
    let value = listOfAssets.split(",")
    let asserts = []
    //this code will chec whether all the asser are registered in system
    for (let i = 0; i < value.length; i++) {
      try {
        let productKey = await ctx.stub.createCompositeKey("product.id", [
          drugName,
          value[i],
        ])
        JSON.parse(await ctx.stub.getState(productKey))
        asserts.push(productKey)
      } catch (error) {
        return { msg: `Drug ${value[i]} not yet registered` }
      }
    }

    let poKey = await ctx.stub.createCompositeKey("created.po", [
      buyerCRN,
      drugName,
    ])
    let drugDetails

    //Check whether PO was created or not
    try {
      drugDetails = JSON.parse(await ctx.stub.getState(poKey))
      console.log(`Drug PO quantity ${drugDetails.quantity}`)
    } catch (error) {
      return { msg: `Buyer ${buyerCRN} not created Po for drug ${drugName}` }
    }

    //The length of ‘listOfAssets’ should be exactly equal to the quantity specified in the PO.
    if (parseInt(drugDetails.quantity) !== value.length) {
      return { msg: "Assert count is not equal to Quantity" }
    }
    //Searching for transporter using crn number
    let transporteriter = await ctx.stub.getStateByPartialCompositeKey(
      "register.company",
      [transporterCRN]
    )

    const transporterDetails = await this.getAllResults(transporteriter)
    if (transporterDetails.length > 1 || transporterDetails.length == 0) {
      return { msg: `Entry Not Correct for companyCRN ${transporterCRN}` }
    }

    //Create shipment composit Key
    let shipmentKey = await ctx.stub.createCompositeKey("created.shipment", [
      buyerCRN,
      drugName,
    ])

    let data = {
      shipmentID: shipmentKey,
      creator: drugDetails.seller,
      asserts,
      transporter: transporterDetails[0].companyID,
      status: "in-transit",
    }
    let dataBuffer = Buffer.from(JSON.stringify(data))
    await ctx.stub.putState(shipmentKey, dataBuffer)
    return data
  }

  /**
   *
   * @param {*} buyerCRN
   * @param {*} drugName
   * @param {*} transporterCRN
   * @returns
   */
  async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
    let authorizedParties = ["TransporterMSP"]
    if (!authorizedParties.includes(ctx.clientIdentity.getMSPID())) {
      return { msg: "Only Transprator Can Access This Operation" }
    }

    //Create shipment composit Key
    let shipmentKey = await ctx.stub.createCompositeKey("created.shipment", [
      buyerCRN,
      drugName,
    ])

    let shipmetData
    try {
      shipmetData = JSON.parse(await ctx.stub.getState(shipmentKey))
    } catch (error) {
      return {
        msg: "Shipment was not created for buyer ${buyerCRN} for drug ${drugName}",
      }
    }

    let updatedData = {
      ...shipmetData,
      status: "delivered",
    }
    //Updated shipment status on ledger
    let dataBuffer = Buffer.from(JSON.stringify(updatedData))
    await ctx.stub.putState(shipmentKey, dataBuffer)

    let buyeriter = await ctx.stub.getStateByPartialCompositeKey(
      "register.company",
      [buyerCRN]
    )

    const buyerDetails = await this.getAllResults(buyeriter)
    if (buyerDetails.length > 1 || buyerDetails.length == 0) {
      return { msg: `Entry Not Correct for companyCRN ${buyerCRN}` }
    }

    for (let i = 0; i < shipmetData.asserts.length; i++) {
      let productDetails = JSON.parse(
        await ctx.stub.getState(shipmetData.asserts[i])
      )

      let updatedProductDetails = {
        ...productDetails,
        shipment: shipmentKey,
        owner: buyerDetails[0].companyID,
      }

      //Updated shipment and owner for individual sku
      let dataBuffer1 = Buffer.from(JSON.stringify(updatedProductDetails))
      await ctx.stub.putState(shipmetData.asserts[i], dataBuffer1)
    }

    return updatedData
  }

  /**
   *
   * @param {*} ctx
   * @param {*} drugName
   * @param {*} serialNo
   * @param {*} retailerCRN
   * @param {*} customerAadhar
   */
  async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
    let retaileriter = await ctx.stub.getStateByPartialCompositeKey(
      "register.company",
      [retailerCRN]
    )

    const retailerDetails = await this.getAllResults(retaileriter)
    if (retailerDetails.length > 1 || retailerDetails.length == 0) {
      return { msg: `Entry Not Correct for retailerCRN ${retailerCRN}` }
    }

    let authorizedParties = ["RetailerMSP"]
    if (!authorizedParties.includes(ctx.clientIdentity.getMSPID())) {
      return { msg: "Only Retailer Can Access This Operation" }
    }
    let productCompositKey = await ctx.stub.createCompositeKey("product.id", [
      drugName,
      serialNo,
    ])
    console.log("After productCompositKey")
    let productDetails
    //Getting drug composit key
    try {
      productDetails = JSON.parse(await ctx.stub.getState(productCompositKey))
    } catch (error) {
      return { msg: `Drug ${drugName} ${serialNo} not registered` }
    }
    let updatedData = {
      ...productDetails,
      owner: customerAadhar,
    }
    console.log("After updatedData")
    let dataBuffer = Buffer.from(JSON.stringify(updatedData))
    await ctx.stub.putState(productCompositKey, dataBuffer)

    return updatedData
  }

  /**
   *
   * @param {*} ctx
   * @param {*} drugName
   * @param {*} serialNo
   */
  async viewDrugCurrentState(ctx, drugName, serialNo) {
    let productCompositKey = await ctx.stub.createCompositeKey("product.id", [
      drugName,
      serialNo,
    ])
    let productDetails
    //Getting drug composit key
    try {
      productDetails = JSON.parse(await ctx.stub.getState(productCompositKey))
    } catch (error) {
      return { msg: `Drug ${drugName} ${serialNo} not registered` }
    }
    return productDetails
  }
}

module.exports = transferdrug
