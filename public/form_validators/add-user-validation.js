
$(document).ready(function() {

    //Regex code for declaring all input validation standard
    let vname = /^[a-zA-Z ]*$/;
    let vphone = /^(01[15]{1}[0-9]{8})$|^(01[02346789]{1}[0-9]{7})$/;
    let vemail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    //Additional regex method for validators
    $.validator.addMethod("regexName",function(value,element,regexpr)
    {
        return regexpr.test(value);
    },"*Name should only consists of alphabets");
    
    $.validator.addMethod("regexPhone",function(value,element,regexpr)
    {
        return regexpr.test(value);
    },"*Please enter only Malaysia's phone number");
    
    $.validator.addMethod("regexEmail",function(value,element,regexpr)
    {
        return regexpr.test(value);
    },"*Please enter valid email");
    
    $("#add-user-form").validate({
    
         ignore: false,
         ignoreTitle: true,
         focusInvalid: false,
         errorClass: "validatorError",
         errorElement: "span",
    
         rules:
         {
             add_name:
             {
                 required: true,
                 regexName: vname,
             },
    
             add_phone:
             {
                 required:true,
                 regexPhone: vphone,
             },
    
             add_email:
             {
                 required:true,
                 regexEmail: vemail,
             }
         },
         messages:
         {
            add_name:
             {
                 required: "*Please enter name",
             },
    
             add_phone:
             {
                 required: "*Please enter phone",
             },
    
             add_email:
             {
                 required: "*Please enter email",
             }
    
         },
         onfocusout: function(element)
         {
            this.element(element);
         },
    
         submitHandler: function()
         {
             App.addUser();
             return false;
         }
         
     });
    
    });
    
    