App = 
{
  loading: false,
  contracts: {},

  load: function()
  {
    App.loadWeb3().then((result) =>
    {
        if(result.length == 0)
        {
          infoBox('info','Info','Please sign in to MetaMask and refresh the page')
        }

        else
        {

            renderAddUserForm()
            App.loadAccount().then((result) =>
            {
                App.loadContract().then((result) =>
                {

                })
            })
        }
    })
  },

  loadWeb3:function()
  {
    return new Promise((resolve,reject)=>{

      if(typeof web3 !== 'undefined')
      {
        web3 = new Web3('http://localhost:7545');
        
      }

      if(window.ethereum)
      {
        try
        {
          window.web3 = new Web3(ethereum)
          //Request account access if necessary
          Promise.all([ethereum.request({ method: 'eth_accounts' })]).then(([result])=>{

            resolve(result)

         })

         web3.eth.sendTransaction({/* ... */})
        }

       catch (error) {
        // User denied account access...
      }
        
      }

    }).catch(function(err)
    {
      resolve(err)
    })
  },

  loadAccount: function()
  {
    return new Promise((resolve,reject)=>{

      Promise.all([ethereum.request({ method: 'eth_accounts' })]).then(([ethAccounts])=>{

        web3.eth.defaultAccount = ethAccounts[0]
        $("#lblAddress").html("Address:"+web3.eth.defaultAccount)

        resolve(web3.eth.defaultAccount)

     })

    }).catch(function(err)
    {
      resolve(err)
    })
  },

  loadContract: function()
  {

    return new Promise((resolve,reject)=>{

      Promise.all([$.getJSON('OffChainDataStorage.json')]).then(([ocds])=>{
        
        App.contracts.OCDS = TruffleContract(ocds)
        App.contracts.OCDS.setProvider(new Web3.providers.HttpProvider("http://127.0.0.1:7545"))

      Promise.all([App.contracts.OCDS.deployed()]).then(([result])=>{

        App.ocds = result
        resolve(result)

      }).catch(function(err)
      {
        resolve(err)
      })

      })
      
    })

  },

  addUser: function()
  {
    lockAddButton('btnAddUserInfo')
    $('#add-user-form').submit(function(e){ 
      e.preventDefault();
    });

    var temp = new Array()
    var generated_address = generateRandomAddress()
    generated_address = generated_address.toLowerCase()

    return new Promise((resolve,reject)=>{

        Promise.all([App.ocds.getUsers()]).then(([dataAddresses])=>{

            for(let i=0;i<dataAddresses.length;i++)
            {   
                temp.push(App.ocds.getUserDetails(dataAddresses[i]))

            }

            Promise.all(temp).then(ocds_data=>
            {
                let duplicateAddress = false
                
                for(let i=0;i<ocds_data.length;i++)
                {   

                    if(ocds_data[i][0] == generated_address)
                    {
                        duplicateAddress = true
                        break
                    }

                    else
                    {
                        duplicateAddress = false
                    }
                }

               
                while (duplicateAddress == true) 
                {
                    App.addUser()
                }

                if(duplicateAddress == false)
                {

                    Promise.all([App.ocds.createUser(generated_address)]).then(([result])=>{

                      let data =
                      {
                        ahash: generated_address,
                        aname:$("#input-name").val(),
                        aphone:$('#input-phone').val(),
                        aemail:$("#input-email").val()
                      }
  
                      $.ajax({
                        type: 'POST',
                        url:'/addUserInfo',
                        data:data,
                        cache: false,
                        dataType: "json",
                    
                        success:function(response)
                        {  
                          unlockAddButton('btnAddUserInfo','Add New User')
                          resolve(response)
                          window.location.replace("./adduser");
                        },
                        error:function(jqXHR)
                        {  
                              if (jqXHR.status == 500) 
                              {
                                alert(jqXHR.responseText)
                              } 
                              else 
                              {
                                alert('Unexpected error.');
                              }
                            }  
                    
                        });
                        
                    }).catch(function(err)
                    {
                      unlockAddButton('btnAddUserInfo','Add New User')
                      infoBox('info','Info','Please make sure that Ganache is active')
                    })
                }
            })

        }).catch(function(err)
        {
          unlockAddButton('btnAddUserInfo','Add New User')
          infoBox('info','Info','Please make sure that Ganache is active')
        })

    }).catch(function(err)
    {
      unlockAddButton('btnAddUserInfo','Add New User')
      infoBox('info','Info','Please make sure that Ganache is active')
    })
  },

}

$(() => {
  $(window).load(() => {
    App.load()
  })
})

function generateRandomAddress()
{

    const id = [...crypto.getRandomValues(new Uint8Array(32))].map(m=>('0'+m.toString(16)).slice(-2)).join('');
    const privateKey = "0x"+id;

    const generated_address = new ethers.Wallet(privateKey);

    return generated_address.address
}

function renderAddUserForm()
{
  $("#add-user-form").html(`<div id="add-address-container">

  <label id="container-title">Add User</label>
  
  
  <label id="lbl-form">Name:</label>
  <input id="input-name" type="text" name="add_name" placeholder="Name">
  
  <label id="lbl-form">Phone:</label>
  <input id="input-phone" type="text" name="add_phone" placeholder="Phone">
  
  <label id="lbl-form">Email:</label>
  <input id="input-email" type="text" name="add_email" placeholder="Email">
  
  
  <button id="btnAddUserInfo">Add New User</button>
  
  </div>`);
}

function infoBox(icon,title,text)
{
  const alertbox =  Swal.fire({

    allowOutsideClick: false,
    icon: icon,
    title: title,
    text: text,

  })
}

function redirectToUserPanel()
{
  window.location.replace("./");
}

function lockAddButton(id)
{
  $('#'+id).prop('disabled', true); 
  $('#'+id).addClass('disable-pointer');
  return $('#'+id).html('<span id="loading"></span> Add New User')
}

function unlockAddButton(id,htmlString)
{
  $('#'+id).prop('disabled', false); 
  $('#'+id).removeClass('disable-pointer');
  return $('#'+id).html(htmlString)
}

