const transactionModel = require("../models/transaction.model.js")
const ledgerModel = require("../models/ledger.model.js")
const accountModel = require("../models/account.model.js")
const EmailService = require("../services/email.service.js")
const { default: mongoose } = require("mongoose")

async function createTransaction(req, res){

    // Validate request

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
               message: "FromAccount, toAccount, amount, idempotencyKey are required"
        })
    }
    const fromUserAccount = await accountModel.findOne({
          _id: fromAccount
    })
    const toUserAccount = await accountModel.findOne({
          _id: toAccount
    })
    if(!fromUserAccount || !toUserAccount){
        return res.status(400).json({
             message: "Invalid fromAccount or toAccount "
        })
    }

    // Validate Idempotency Key

    const isTransactionAlreadyExists = await transactionModel.findOne({
          idempotencyKey: idempotencyKey
    })

    if(isTransactionAlreadyExists){
        if(isTransactionAlreadyExists.status === "COMPLETE"){
            return res.status(200).json({
                   message: "Transaction already proccessed",
                   transaction: isTransactionAlreadyExists
            })
        }
     if(isTransactionAlreadyExists.status === "PENDING"){
            return res.status(200).json({
                message: "Transaction is still processing",
                transaction: isTransactionAlreadyExists
            })
    }

    if(isTransactionAlreadyExists.status === "FAILED"){
        res.status(500).json({
            message: "Transaction processing failed, please retry",
            transaction: isTransactionAlreadyExists
        })
    }

    if(isTransactionAlreadyExists.status === "REVERSED"){
        return res.status(500).json({
               message: "Transaction was reversed, Please Retry",
               transaction: isTransactionAlreadyExists
        })
    }
    }

    // Check Account Status

    if(fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE"){
        return res.status(400).json({
            message: "Both Account are must be ACTIVE to process transaction"
        })
    }

    // Derive sender balance from ledger

    const balance = await fromUserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`
        })
    }

    let transaction;
    try{

    // Create Transaction (PENDING)

    const session = await mongoose.startSession()
    session.startTransaction()

    transaction = (await transactionModel.create([{
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING",
    }], { session }))[ 0 ]

    const debitLedgerEntry = await ledgerModel.create({
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
    }, { session })

    await (() => {
          return new Promise((resolve) => setTimeout(resolve, 100 * 1000))
    })()

    const creditLedgerEntry = await ledgerModel.create({
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT"
    }, { session })

    await transactionModel.findOneAndUpdate(
          { _id: transaction._id },
          { status: "COMPLETE" },
          { session }
    )

    await session.commitTransaction()
    session.endSession()
} catch (error){

    return res.status(400).json({
        message: "Transaction is Pending due to some issue, Please retry after sometime",
    })
}

    // SEND EMAIL

    await EmailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount, req.user._id)

    return res.status(201).json({
        message: "Transaction Complete Successfully",
        transaction: transaction
    })
}

async function createInitialFundsTransaction(req, res){

    const { toAccount, amount, idempotencyKey } = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey is required"
        })
    }
      
    const toUserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!toUserAccount){
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
          user: req.user._id
    }) 

    if(!fromUserAccount){
        return res.status(400).json({
            message: "System user account not found"
        })
    }

     const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })
}

module.exports = { createTransaction, createInitialFundsTransaction }