import nodefonyclient from 'nodefony-client';

class IframeQuery extends nodefonyclient.Service {

  constructor(container, iframe) {
    super("media_viewer_iframequery", container, null, process.env);
    this.queries = {};
    this.anyQueries = {};
    this.global_msg_id = 0;
    this.iframe = iframe;
  }

  finalizeQueryAny(property, data, resolve) {
    const queries = this.anyQueries[property];
    if (!queries) {
      return;
    }

    for (const query of queries) {
      if (!query) {
        continue;
      }
      if (query.timer) {
        clearTimeout(query.timer);
        query.timer = undefined;
      }

      if (resolve) {
        query.success(data);
      } else {
        query.error(data);
      }
    }
    this.anyQueries[property] = [];
  }

  finalizeQueryId(id, data, resolve) {
    const query = this.queries[id];
    if (!query) {
      return;
    }

    if (query.timer) {
      clearTimeout(query.timer);
      query.timer = undefined;
    }

    if (resolve) {
      query.success(data);
    } else {
      query.error(data);
    }
    delete this.queries[id];
  }

  async queryWaitId(message, timeout) {
    const property = message.action;
    message.id = this.global_msg_id++;

    return new Promise((resolve, reject) => {
      this.log(`Creating query for property ${property}`, "DEBUG");
      let timer = undefined;
      if (timeout) {
        timer = setTimeout(() => {
          clearTimeout(timer);
          delete this.queries[message.id];
          return reject(`${property} result timed out`);
        }, timeout);
      }
      this.queries[message.id] = {
        success: resolve,
        error: reject,
        timer: timer
      };
      this.log(`Posting message ${JSON.stringify(message)} to iframe`, "DEBUG");

      this.iframe.postMessage(message);
    });
  }

  async queryWaitAny(message, timeout) {
    const property = message.action;
    this.anyQueries[property] = this.anyQueries[property] || [];

    return new Promise((resolve, reject) => {
      this.log(`Creating query for property ${property}`, "DEBUG");
      let timer = undefined;
      if (timeout) {
        timer = setTimeout(() => {
          clearTimeout(timer);
          this.finalizeQueryAny(property, `${property} result timed out`, false); 
        }, timeout);
      }
      this.anyQueries[property].push({
        success: resolve,
        error: reject,
        timer: timer
      });
      this.log(`Posting message ${JSON.stringify(message)} to iframe`, "DEBUG");

      this.iframe.postMessage(message);
    });
  }
};

export default IframeQuery;