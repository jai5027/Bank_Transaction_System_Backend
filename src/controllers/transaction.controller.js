const transactionModel = require("../models/transaction.model.js")
const ledgerModel = require("../models/ledger.model.js")
const accountModel = require("../models/account.model.js")
const sendRegistrationEmail = require("../services/email.service.js")

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
    if(!fromAccount || !toAccount){
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
    }
}