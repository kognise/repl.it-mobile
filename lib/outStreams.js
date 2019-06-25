import { Writable } from 'stream'

export default (log)=>{
  class Stdout extends Writable {
    constructor(options){
      super(options)
    }
    _write(chunk, encoding, callback){
      let error
      try{
        log(chunk, false)
      }
      catch(err){
        error = err
      }
      callback(error)
    }
  }
  
  class Stderr extends Writable {
    constructor(options){
      super(options)
    }
    _write(chunk, encoding, callback){
      let error
      try{
        log(chunk, true)
      }
      catch(err){
        error = err
      }
      callback(error)
    }
  }
  
  return [new Stdout(), new Stderr()]
}