let test = new ClientAPI("http://192.168.178.109:49374");

test.eventSource.addEventListener("radio-erp1", (event) => {
  console.log("radio-erp1", event.data);
});

test.eventSource.addEventListener("data", (event) => {
  console.log("data", event.data);
});
