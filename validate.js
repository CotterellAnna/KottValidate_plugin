(function($){
    $.fn.validateForm = function(options){
        // plugin defaults
        let defaults = {
            optionalFields : [],
            checkPasswordStrength: false,
            passwordStrict: false,
            confirmPassword : [],
            customFeedbackMsg : {},
            complete: function(){},
        }
        let settings = $.extend( defaults, options)

        
        let isEmpty = false
        let isPasswordValid = true
        let isPasswordMatch = true
        let isValidEmail = true
        let radioNames = {}

        return this.each(function(){
            try{

                let optionalFields = ""
                
                for(x in defaults.optionalFields){

                    if(x == defaults.optionalFields.length-1){
                        optionalFields += defaults.optionalFields[x]
                    }else{
                        optionalFields += `${defaults.optionalFields[x]},`
                    }
                }
                $(this).find("input, select, textarea, datalist").not(`${optionalFields}`).each(function(){
                    
                    // check for empty input fields
                    findEmpty($(this))

                    // validate email input field
                    if($(this).attr("type") == "email"){
                        validateEmail($(this))
                    }
                    
                    // Create an object of radio input fields
                    if($(this).attr("type") == "radio"){
                        if(radioNames.hasOwnProperty($(this).attr("name"))){
                            radioNames[($(this).attr("name"))].push($(this))
                        }else{
                            radioNames[($(this).attr("name"))] = [$(this)]
                        }
                    }
                })

                //check for passowrd strength
                if(defaults.checkPasswordStrength == true){
                    $(":password").each(function(){
                        passwordStrenght($(this))
                    })
                }

                if(Object.keys(radioNames).length != 0){
                    validateRadios(radioNames)
                }

                // if the user wants to check for confirm password 
                if(defaults.confirmPassword.length == 2){
                    confirmPassword(defaults.confirmPassword[0], defaults.confirmPassword[1])
                }

                // on successeful validation, run the complete function
                if(isEmpty == false  && isPasswordValid == true && isPasswordMatch == true && isValidEmail == true){
                    defaults.complete()
                }
            }
            catch(err){
                console.log(err)
            }
            
            
        })

        // function to get custom feedback message
        function customMsg(element){
            if($.inArray($(element).attr("id"), Object.keys(defaults.customFeedbackMsg)) >= 0 ){
                return(defaults.customFeedbackMsg[element.attr("id")])
            }else if($.inArray($(element).attr("name"), Object.keys(defaults.customFeedbackMsg)) >= 0 ){
                return(defaults.customFeedbackMsg[element.attr("name")])
            }
            else if($.inArray($(element).attr("type"), Object.keys(defaults.customFeedbackMsg)) >= 0 ){
                return(defaults.customFeedbackMsg[element.attr("type")])
            }else{
                return 0
            }
        }
        // function to find empty input fields
        function findEmpty(element){
            // create the error message element
            let feedbackMsg = $("<p>", {class: "feedbackMsg emptyField"})

            // check if there is a custom message available
            if(!customMsg(element) == 0){
                feedbackMsg.html(customMsg(element))
            }
            // use the default text
            else{
                feedbackMsg.html("This field cannot be empty*")
            }


            if(element.val().length == 0){

                element.removeClass("invalid valid")
                element.addClass("invalid")
                // check if the next element is the invalid message
                if(element.next().hasClass("feedbackMsg")){
                    // remove the invalid message to avoid repitition
                    element.next().remove()
                }
                // insert the invalid message
                element.after(feedbackMsg)
                isEmpty = true
            }else{
                // check if the next element is the invalid message
                if(element.next().hasClass("feedbackMsg emptyField")){

                    element.removeClass("invalid valid")
                    element.addClass("valid")

                    // remove the invalid message
                    element.next().remove()
                }
            }
        }
        // function to check if passwords match
        function confirmPassword(p1, p2){
            // create the error message element
            let feedbackMsg = $("<p>", {class: "feedbackMsg clashingPasswords"})
            feedbackMsg.html("Passwords don't match*")
            // check if password one and password two are same 
            if( p1.value != p2.value){
                if($(p2).next().hasClass("feedbackMsg")){
                    $(p2).next().remove()
                }
                $(p1, p2).removeClass("invalid valid")

                $(p1).addClass("invalid")
                $(p2).addClass("invalid")
                
                $(p2).after(feedbackMsg)
                isPasswordValid = false
            }else{
                if($(p2).next().hasClass("feedbackMsg clashingPasswords")){

                    $(p1, p2).removeClass("invalid valid")

                    $(p1).addClass("valid")
                    $(p2).addClass("valid")

                    $(p2).next().remove()
                }
                isPasswordValid = true
            }
        }

        // function to check password strength
        function passwordStrenght(passowrd){
            // create passwordStrengthMsg element
            let passwordStrengthMsg = $("<p>", {id:"password-strnegth-status"})
            // regex for strong password
            let strongRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})")
            // regex for medium password
            let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})")
            // check if the password field is empty
            if($(passowrd).val() != ""){
                // check if it matches the strongRegex
                if(strongRegex.test($(passowrd).val())){

                    $(passowrd).removeClass("invalid valid")
                    $(passowrd).addClass("valid")

                    // remove all classes from the passwordSrengthMsg if any
                    passwordStrengthMsg.removeClass()
                    passwordStrengthMsg.addClass("strong-password")
                    passwordStrengthMsg.html("Strong password")
                }
                // check if it matches the mediuimRegex
                else if (mediumRegex.test($(passowrd).val())){
                    passwordStrengthMsg.removeClass()
                    if(defaults.passwordStrict == true){
                        isPasswordValid = false
                        $(passowrd).removeClass("invalid valid")
                        $(passowrd).addClass("invalid")
                        passwordStrengthMsg.addClass("feedbackMsg")
                        passwordStrengthMsg.html("Password must have at least 8 characters and contain at least 1 lowercase, 1 uppercase and 1 special character")
                    }else{
                        $(passowrd).removeClass("invalid valid")
                        $(passowrd).addClass("valid")
                        passwordStrengthMsg.addClass("medium-password")
                        passwordStrengthMsg.html("Password stength: Medium")
                    }
                }
                // else the password is weak
                else{
                    isPasswordMatch = false
                    if(defaults.passwordStrict == true){
                        passwordStrengthMsg.html("Weak password: Password must have at least 8 characters and contain at least one lowercase, one uppercase, one special and one special character")
                    }else{
                        passwordStrengthMsg.html("Weak password: Password must have at least 6 characters and contain at least one lowercase and one uppercase character or has at least one lowercase and one numeric character or has at least one uppercase and one numeric character")
                    }
                    $(passowrd).removeClass("invalid valid")
                    $(passowrd).addClass("invalid")
                    passwordStrengthMsg.removeClass()
                    passwordStrengthMsg.addClass("feedbackMsg")
                }
                if($(passowrd).next().attr("id") == "password-strnegth-status" ){
                    $(passowrd).next().remove()
                }
                $(passowrd).after(passwordStrengthMsg)
            }
        }

        // function to validate email
        function validateEmail(email){
            let feedbackMsg = $("<p>", {class: "feedbackMsg"})

            // check if there is a custom message available
            if(!customMsg(email) == 0){
                feedbackMsg.html(customMsg(email))
            }
            // use the default text
            else{
                feedbackMsg.html("Please enter a valid email address*")
            }

            let validEmailRegex = /^\S+@\S+\.\S+$/
            if($(email).val() != ""){
                if(!validEmailRegex.test($(email).val())){
                    isValidEmail = false
                    if($(email).next().hasClass("feedbackMsg")){
                        $(email).next().remove()
                    }
                    $(email).removeClass("invalid valid")
                    $(email).addClass("invalid")
                    $(email).after(feedbackMsg)
                }else{
                    if($(email).next().hasClass("feedbackMsg")){
                        $(email).next().remove()
                    }
                    $(email).removeClass("invalid valid")
                    $(email).addClass("valid")
                }
            }
        }

        // function to validate a group of radio input fields
        function validateRadios(radioNames){
            let feedbackMsg = $("<p>", {class: "feedbackMsg"})

            $.each(Object.keys(radioNames), function(i,v){
                // check if there is a custom message available
                if(!customMsg(radioNames[v][i]) == 0){
                    feedbackMsg.html(customMsg(radioNames[v][i]))
                }
                // use the default text
                else{
                    feedbackMsg.html("Please pick one option*")
                }

                let vals = []
                let errMSgPlc = radioNames[v][radioNames[v].length-1].parent()

                $(radioNames[v]).each(function(){
                    vals.push($(this)[0].checked)
                })
                if($.inArray(true, vals) == -1){
                    if(errMSgPlc.next().hasClass("feedbackMsg")){
                        errMSgPlc.next().remove()
                    }
                    errMSgPlc.after(feedbackMsg)
                }else{
                    if(errMSgPlc.next().hasClass("feedbackMsg")){
                        errMSgPlc.next().remove()
                    }
                }
            })
        }
    }
}(jQuery))