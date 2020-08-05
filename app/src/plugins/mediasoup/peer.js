
import nodefony from 'nodefony';

const defaultOptions = {

};

class Peer extends nodefony.Service{
  constructor(id, mediasoup, options, container) {
    let defaultOpt = nodefony.extend( {}, defaultOptions);
    super("Peer", container, null, nodefony.extend({}, defaultOpt, options));
    this.id = id;
    this.mediasoup = mediasoup ;
  }
}

export default Peer;
