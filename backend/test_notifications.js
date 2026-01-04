const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function main(){
  try{
    const base = 'http://localhost:5000';
    // 1. create notification
    let res = await fetch(base + '/admin/notification/add', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({role: 'ALL', title: 'TestNotif', message: 'Test message for read flow'})
    });
    const create = await res.text();
    console.log('/admin/notification/add ->', res.status, create);

    // 2. get admin notifications
    res = await fetch(base + '/admin/notifications');
    const list = await res.json();
    console.log('/admin/notifications -> count', list.length);
    if(!list.length) return;
    const nid = list[0]._id;
    console.log('Using notification id', nid);

    // 3. mark read (compat route)
    const userId = '000000000000000000000001';
    res = await fetch(`${base}/notifications/${nid}/read`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ userId })
    });
    const mark = await res.text();
    console.log(`/notifications/${nid}/read ->`, res.status, mark);

    // 4. fetch notifications for user
    res = await fetch(`${base}/notifications/${userId}?role=ALL`);
    const userNotifs = await res.json();
    console.log(`/notifications/${userId}?role=ALL -> count`, userNotifs.length);
    const found = userNotifs.find(n => n._id === nid);
    console.log('Found notification read flag:', found ? found.read : 'not found');
  }catch(err){
    console.error('TEST ERROR', err);
  }
}

main();
