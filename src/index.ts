
const MoltenWebReact = (app: e.Application, socket: SocketIO.Socket,
    options = {}: MDB.WebOptions) => {
  
  return <MDB.WebInstance>{
    navigate,
    alert,
    status
  };
};
