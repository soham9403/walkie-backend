export default {
  array: {
    type: Array,
    default:[]
  },
  stringOnly: {
    type: String,
    default: ''
  },
  stringAndRequired: {
    type: String,
    required: true
  },
  stringAndUnique: {
    type: String,
    required: true,
    unique: true
  },
  numberOnly: {
    type: Number
  },
  enumAndRequired: list => {
    return {
      type: String,
      enum: list,
      required: true
    }
  },
  booleanAndRequired: (defaultVal = 0) => {
    return {
      type: Boolean,
      required: true,
      default: defaultVal
    }
  },
  boolean: (defaultVal = 0) => {
    return {
      type: Boolean,
      default: defaultVal
    }
  }
}
