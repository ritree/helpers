import $ from 'jquery';
import path from 'path';

class Server {
  constructor() {
    this.xhrPoolCollection = new Set();
  }

  // по событию сбрасываем все запросы к серверу 
  abortAllXHR(){
    this.xhrPoolCollection.forEach((xhr)=>{
      if(xhr.state() == 'pending'){
        xhr.abort();
      }
    })

    this.xhrPoolCollection.clear();
  }

  // Обертка над запросами $.ajax
  fetch(params) {
    return $.ajax(params);
  }

  get(params) {
    let request = $.ajax(Object.assign({
      type: 'GET',
      dataType: 'JSON'
    }, params));

    this.xhrPoolCollection.add(request);
    return request;
  }

  post(params) {
    let request = $.ajax(Object.assign({
      type: 'POST',
      dataType: 'JSON'
    }, params));

    this.xhrPoolCollection.add(request);
    return request;
  }

  delete(params) {
    let request = $.ajax(Object.assign({
      type: 'DELETE',
      dataType: 'JSON'
    }, params));

    this.xhrPoolCollection.add(request);
    return request;
  }
}

let server = new Server();

export {server as Server};
