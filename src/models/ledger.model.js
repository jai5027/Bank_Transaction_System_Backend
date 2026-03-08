const mongoose = require('mongoose')

const ledgerSchema = new mongoose.Schema({
      account: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "account",
           required: [true , "Ledger must be associated with an account"],
           index: true,
           immutable: true
      },

      amount: {
           type: Number,
           required: [true, "Amount is required for creating a ledger entry"],
           immutable: true
      },

      transaction: {
           type: mongoose.Schema.Types.ObjectId,
           ref: "transaction",
           required: [true, "Ledger must be associated with a transaction"],
           index: true,
           immutable: true
      },

      type: {
           type: String,
           enum: {
            values: [ "CREDIT", "DEBIT" ],
            message: "Type can be either CREDIT and DEBIT",
           },
           required: [true, "Ledger type is required"],
           immutable: true
      }
})

function preventLederModification() {
    throw new Error("Ledger entries cannot be modified once created")
}

ledgerSchema.pre('findOneAndUpdate', preventLederModification)
ledgerSchema.pre('updateOne', preventLederModification)
ledgerSchema.pre('remove', preventLederModification)
ledgerSchema.pre('update', preventLederModification)
ledgerSchema.pre('deleteMany', preventLederModification)
ledgerSchema.pre('deleteOne', preventLederModification)
ledgerSchema.pre('findOneAndDelete', preventLederModification)
ledgerSchema.pre('findOneAndRemove', preventLederModification)
ledgerSchema.pre('findByIdAndDelete', preventLederModification)
ledgerSchema.pre('findByIdAndRemove', preventLederModification)
ledgerSchema.pre('findOneAndReplace', preventLederModification)

const ledgerModel = mongoose.model("ledger", ledgerSchema)

module.exports = ledgerModel