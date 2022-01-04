
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
        App.loadAccount().then((result) =>
        {
          
          App.loadContract().then((result) =>
          {
            App.loadContractData().then((result)=>
            {
              console.log(result)

            }).catch(function(err)
            {
              infoBox('info','Info','Please make sure that Ganache is active')
            })
            
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

  loadContractData: function()
  {
    var temp = new Array()

    return new Promise((resolve,reject)=>{

      Promise.all([App.ocds.getUsers()]).then(([dataAddresses])=>{

        for(let i=0;i<dataAddresses.length;i++)
        {
          temp.push(App.ocds.getUserDetails(dataAddresses[i]))
        }

        Promise.all(temp).then(ocds_data=>
        {        
              let items = ocds_data.map((element, index) => {

                return {
                  address: element[0],
                  isentity: element[1]
                }
              });

           let jsonData = {

              result: items

           }


           $.ajax({
            type: 'POST',
            url:'/postQueryHash',
            data:JSON.stringify(jsonData),
            cache: false,
            dataType: "json",
            contentType: "application/json",
     
            success:function(response)
            {  
              console.log(response)
              let UserArr = response

              $(function() {

                $("#user-table").jsGrid({
                width: "800px",
                height: "800px",
                pageSize: 10,
                autoload: true,
                filtering: false,
                editing: false,
                sorting: true,
                paging: true,
                // data: UserArr,
                controller: {
                  loadData: function(filter)
                  {
                    return UserArr;
                  }
          
                },
                  fields: [
                  { name: "Name", type: "text", width: "20%" },
                  { name: "Phone", type: "text", width: "25%" },
                  { name: "Email", type: "text", width: "25%"  },
          
                  {  
                    title: "Action",
                    name: "Hash", 
                    type: "text", 
                    width: 300,
                    itemTemplate: function(_,item)
                    {

                      let processed_item = escape(JSON.stringify(item))

                      return`<button id="btnLaunchUpdateModal" value="" 
                      onclick="openUpdateModal('${processed_item}')">Edit</button>
                      <button id="btnDeleteUser" value="" onclick="App.deleteUser('${processed_item}');">Delete</button>`
                      

                    }, 
          
                  },
                  ]
                });  
              });

              resolve(true)
            },
           error:function(jqXHR)
           {  
               if (jqXHR.status == 500) 
               {
                infoBox('info','Info','User panel is empty')
               } 
               else 
               {
                 alert('Unexpected error.');
               }
             }  
     
           });

        })


      })

    })
    
  },

  updateUserInfo: function()
  {

    lockUpdateButton('btnUpdateUserInfo')
    $('#update-user-form').submit(function(e){ 
      e.preventDefault();
    });
    
    return new Promise((resolve,reject)=>{

    Promise.all([App.ocds.getUserDetails($("#btnUpdateUserInfo").val())]).then(([result])=>{
      
      let checkExist = result[1]
      if(checkExist == true)
      {
        let data =
        {
          uhash:$("#btnUpdateUserInfo").val(),
          uname:$("#update-name").val(),
          uphone:$('#update-phone').val(),
          uemail:$("#update-email").val()
        }
    
        $.ajax({
          type: 'POST',
          url:'/updateUser',
          data:data,
          cache: false,
          dataType: "json",
      
          success:function(response)
          {  
            resolve(response)
            unlockUpdateButton('btnUpdateUserInfo','Update User Info')
            window.location.replace("./");
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
      }
      
      else
      {
        warningBox('warning','Warning','User does not exist, please refresh the page')
        unlockUpdateButton('btnUpdateUserInfo','Update User Info')
      }

    }).catch(function(err)
    {
      warningBox('warning','Warning','User does not exist, please refresh the page')
      unlockUpdateButton('btnUpdateUserInfo','Update User Info')
    })

  }).catch(function(err)
  {
    infoBox('info','Info','Please make sure that Ganache is active')
    unlockUpdateButton('btnUpdateUserInfo','Update User Info')
  })


  },

  deleteUser: function(user_data)
  {

    Swal.fire({
      title: 'Are you sure you want to delete this user?',
      icon: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
      }).then((result) => {

        if(result.isConfirmed)
        {
          user_data = JSON.parse(unescape(user_data))

          return new Promise((resolve,reject)=>{

            Promise.all([App.ocds.getUserDetails(user_data.Hash)]).then(([result])=>{

              let checkExist = result[1]
              if(checkExist == true)
              {
                Promise.all([App.ocds.deleteUser(user_data.Hash)]).then(([result])=>{
              

                  let data = {
    
                    deletehash: user_data.Hash
        
                 }
        
                  $.ajax({
                    type: 'POST',
                    url:'/deleteUser',
                    data:data,
                    cache: false,
                    dataType: "json",
             
                    success:function(response)
                    {  
                      toastMesg('success','User info has been deleted')
                      resolve(response)
                      App.loadContractData()
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
    
                }).catch(function(err){
          
                  console.log(err)
        
                })
    
              }

              else
              {
                warningBox('warning','Warning','User does not exist, please refresh the page')
              }

            }).catch(function(err)
            {
              warningBox('warning','Warning','User does not exist, please refresh the page')
            })

           
          }).catch(function(err)
          {
            infoBox('info','Info','Please make sure that Ganache is active')
          })
        }

      })
  }

}

$(() => {
  $(window).load(() => {
    App.load()
  })
})

function openUpdateModal(user_data)
{
   user_data = JSON.parse(unescape(user_data))

   $(':input').removeClass('validatorError');
   $( ".validatorError" ).empty();
   $(".popup-overlay, .popup-modal").addClass("active");
   
   $("#update-name").val(user_data.Name);
   $("#update-phone").val(user_data.Phone);
   $("#update-email").val(user_data.Email);
   $("#btnUpdateUserInfo").val(user_data.Hash);

} 

function closeUpdateModal()
{
  $(".popup-overlay, .popup-modal").removeClass("active");
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

function warningBox(icon,title,text)
{
  const warningbox =  Swal.fire({

    allowOutsideClick: false,
    icon: icon,
    title: title,
    text: text,
    footer: 'Please make sure that Ganache is active'

  })
}

//Displaying toast for successful deletion
function toastMesg(icon,title,text,timer,position)
{
  const toast = Swal.mixin({
    toast: true,
    position: position||'top-end',
    showConfirmButton: false,
    timer: timer||3500
    });
      toast.fire({
        title: title,
        text: text,
        icon: icon
    }) 
}

function lockUpdateButton(id)
{
  $('#'+id).prop('disabled', true); 
  $('#'+id).addClass('disable-input');
  return $('#'+id).html('<span id="loading"></span> Update User Info')
}

function unlockUpdateButton(id,htmlString)
{
  $('#'+id).prop('disabled', false); 
  $('#'+id).removeClass('disable-input');
  return $('#'+id).html(htmlString)
}

function redirectToAddUser()
{
  window.location.replace("./adduser");
}









