import { TheWorkflows } from '../the-workflows';

TheWorkflows.on({
  type: 'login',
  cb(e) {
    console.log(e.username);
  }
})
