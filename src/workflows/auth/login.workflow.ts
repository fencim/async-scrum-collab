import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'login',
  loggable: 'post-operation',
  cb(e) {
    console.log(e.username);
  }
})
