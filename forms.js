var teletracForms = {
    displayFormat: "desktop",
    showInterestSelection: true,
    showELogsSelection: false,
    loggingEnabled: false,
    salesforce: { },
    pardot: { },
    getParameterByName: function(name)
    {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
          var regexS = "[\\?&]" + name + "=([^&#]*)";
          var regex = new RegExp(regexS);
          var results = regex.exec(window.location.search);
          if(results == null)
            return "";
          else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    },
    initPopups: function(formLinkClass)
    {
        var popupWidth = "430px";
        var popupHeight = teletracForms.showInterestSelection ? "660px" : "570px";
        var $link = $("." + formLinkClass);
        var $form = $("#form_" + formLinkClass);
        
        if($form.attr("data-customheight") != null)
        {
            popupHeight = $form.attr("data-customheight");
            if(popupHeight.indexOf("px") < 0)
            {
                popupHeight = popupHeight + "px";
            }
        }
        
        
        if(teletracForms.displayFormat != "desktop")
        {
            popupWidth = ($(window).width() - 10);
            
            var heightAttr = $form.attr('data-colorbox-height');
            
            if (typeof heightAttr !== typeof undefined && heightAttr !== false) {
                if(heightAttr != "")
                {
                    popupHeight = teletracForms.showInterestSelection ? (heightAttr + 90) + "px"  : heightAttr + "px";
                }else
                {
                    popupHeight = teletracForms.showInterestSelection ? "900px" : "810px";
                }
            }
            else
            {
                popupHeight = teletracForms.showInterestSelection ? "900px" : "810px";
            }
        }
        
       $link.colorbox({width:popupWidth,height:popupHeight, scrolling:false, inline:true, href:"#form_" + formLinkClass, onOpen: function(){
          var $link = $(this);
          var $formContainer = $("#form_" + formLinkClass);
          $formContainer.find(".interest-selection input").removeAttr("checked").prop("checked", false);

           var defaultInterestValue = $formContainer.find("input[name='00N60000002FMQr']").val();
           var defaultInterestCheckbox = $formContainer.find(".interest-selection input[value='"+ defaultInterestValue +"']");
           if(defaultInterestCheckbox != null && defaultInterestCheckbox.length > 0)
           {
               $(defaultInterestCheckbox).attr("checked","checked");
               $(defaultInterestCheckbox).prop("checked",true);
               $(defaultInterestCheckbox).change();
           }    
           
           if($link.hasClass("cta-download"))
           {
               $formContainer.find("#formTitle").text($link.attr("data-title"));
               $formContainer.find("input[name='00N32000002znCp']").val($link.attr("data-name"));
               $formContainer.find("input[name='00N32000002znCk']").val($link.attr("data-name"));
               $formContainer.find("input[name='download-group']").val($link.attr("data-group"));
               var d = new Date();
               var minutes = 5;
               teletracForms.setCookie("ttd-" + $link.attr("data-group"),  d.getMilliseconds(), new Date(d.getTime() + (minutes * 60000)));
           }
       }});
       
       
    },
    initLegacyForms: function()
    {
        $(".green-txt-btn.demo.cboxElement").addClass("cta-demo").removeAttr("onclick");
    },
    getOptimizelyVal: function()
    {
        var optVal = "";
        try
        {
            window['optimizely'] = window['optimizely'] || [];
        	var optState = window['optimizely'].data.state;
    		if (optState != null) 
    		{
    			var experimentId;
    			var variationName;
    			for(var key in optState.variationNamesMap) {
    			    var isActiveExp = window['optimizely']['allExperiments'][key]['enabled'] == true;
    			    console.log(key + ": " + isActiveExp);
    			    if(isActiveExp)
    			    {
    				    experimentId = key != "" ? key : experimentId;
        			    variationName = optState.variationNamesMap[key] != "" ? optState.variationNamesMap[key] : optState.variationNamesMap[key];
    			    }
    			}
    			if(experimentId != undefined)
    			{
    			    optVal = "ExperimentID: " + experimentId + "; VariationName: " + variationName;
    			}
    		}
        }catch(err)
        {
            console.log("Error setting optimizely SFDC field.");
        }  
        return optVal;
    },
    log: function(level, message, email, notes)
    {
        try
        {
            var userIp = $("input[name='00N60000002FMKZ']").val();
            if(teletracForms.loggingEnabled)
            {
                //add logging code here
                $.ajax({
                    url: "http://tl.teletrac.com/api/logs/add",
                    type: "POST",
                    //dataType: "jsonp",
                    data: { level: level, category: "Forms", email: encodeURI(email), message: encodeURI(message), ip: encodeURI(userIp), notes: encodeURI(notes), url: encodeURI(window.location.href) },
                    success: function (d) {
                        
                    },error:function(err)
                    {
                        console.log("Form log error" + err.statusText);
                    }
                });
            }
        }catch(err)
        {
            console.log("Error: Forms Logging");
        }
    }
};

$(function(){
    try
    {
        //for IE and Edge
        if (!window.location.origin) {
          window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
        }    
    }catch(err)
    {
        //well, we tried IE...
    }
    
    /***************** Forms have 2 display modes, handle onload and onresize *****************/
    if(window.innerWidth <= 500)
    {
        teletracForms.displayFormat = "mobile";
    }
    
    $(window).resize(function(){
        var newDisplayFormat = window.innerWidth <= 500 ? "mobile" : "desktop";
        if(newDisplayFormat != teletracForms.displayFormat)
        {
            teletracForms.displayFormat = newDisplayFormat;
            $("div[data-role='form-salesforce']").each(function(){
                $(this).attr("id","form_" + $(this).attr("data-form"));
                teletracForms.initPopups($(this).attr("data-form"));
            });
            $("div[data-role='form-pardot']").each(function(){
                $(this).attr("id","form_" + $(this).attr("data-form"));
                teletracForms.initPopups($(this).attr("data-form"));
            });
        }
    });
    
    /***************** Get and Save Tracking Data to Cookies *****************/
    teletracForms.setCookies();
    
    /***************** Custom Scripts for Legacy Content *****************/
    teletracForms.initLegacyForms();
    
    /***************** Connect Salesforce Forms with Links *****************/
    teletracForms.salesforce.init();
    
    /***************** Connect Pardot Forms with Links *****************/
    teletracForms.pardot.init();
});

/* FORMS COMMON */
teletracForms.setCookies = function()
{
    var cookieDomain = ".teletrac.com";
    if(window.location.hostname.indexOf(".co.uk") !== -1)
    {
      cookieDomain = ".teletrac.co.uk";
    }      
    
    var gclId = teletracForms.getParameterByName("gclid");
    if(gclId == "")
    {
        gclId = teletracForms.getParameterByName("GCLID"); 
    }
        
    var gclIdCookie = $.cookie("gclId");
    if (gclId != "" && gclIdCookie == null) {
        $.cookie("gclId", gclId, { expires: 30 });
        $.cookie("gclId", gclId, { expires: 30, path: '/', domain: cookieDomain });
    } 
    
    //moved this cookie code up before check for mc parameter after call with Bryce on 7/14/2015 
    $.cookie("leadPage", window.location.origin + window.location.pathname, { expires: 30, path: '/', domain: cookieDomain });
    
    var trackingCode = teletracForms.getParameterByName("mc");
    if (trackingCode == null || trackingCode == undefined || trackingCode == "") {
        return;
    }

    //we need to set cookies on the top domian level to access from pardot forms
    var trackingCodeCookie = $.cookie("trackingCode");
    if (trackingCodeCookie == null) {
        $.cookie("trackingCode", trackingCode, { expires: 30 });
        $.cookie("trackingCode", trackingCode, { expires: 30, path: '/', domain: cookieDomain });
    }
  
    var tcCode = teletracForms.getParameterByName("tc");
    var tcCodeCookie = $.cookie("tcCode");
    if (tcCodeCookie == null) {
        $.cookie("tcCode", tcCode, { expires: 30 });
        $.cookie("tcCode", tcCode, { expires: 30, path: '/', domain: cookieDomain });
    }
 
    var landingPageCookie = $.cookie("landingPage");
    if (landingPageCookie == null) {
       $.cookie("landingPage", window.location.origin + window.location.pathname, { expires: 30 });
       $.cookie("landingPage", window.location.origin + window.location.pathname, { expires: 30, path: '/', domain: cookieDomain });
    }
}
teletracForms.setCookie = function(key, value, expiresDate)
{
    var cookieDomain = ".teletrac.com";
    if(window.location.hostname.indexOf(".co.uk") !== -1)
    {
      cookieDomain = ".teletrac.co.uk";
    }
    $.cookie(key, value, { expires: expiresDate, path: '/', domain: cookieDomain });
}



/* SALESFORCE */
teletracForms.salesforce.init = function()
{
    if(typeof(formsShowInterestSelection) != "undefined" && formsShowInterestSelection == false)
    {
        teletracForms.showInterestSelection = false;
    }
    if(typeof(formsShowELogsSelection) != "undefined" && formsShowELogsSelection == true)
    {
        teletracForms.showELogsSelection = true;
    }
    if(typeof(formsLoggingEnabled) != "undefined" && formsLoggingEnabled == true)
    {
        teletracForms.loggingEnabled = true;
    }
    
    /* Attach Click Events */
    $("div[data-role='form-salesforce']").each(function(){
       $(this).attr("id","form_" + $(this).attr("data-form"));
       var $formContainer = $(this);
       if(teletracForms.showInterestSelection)
       {
           //show to user
           $(this).find(".interest-selection").show();
           //set default values
           var defaultInterestValue = $formContainer.find("input[name='00N60000002FMQr']").val();
           var defaultInterestCheckbox = $formContainer.find(".interest-selection input[value='"+ defaultInterestValue +"']");
           if(defaultInterestCheckbox != null && defaultInterestCheckbox.length > 0)
           {
               $(defaultInterestCheckbox).attr("checked","checked");
               $(defaultInterestCheckbox).prop("checked",true);
           }
           
           var hiddenInterestValue = $("#form-static-interest-value").length > 0 ? $("#form-static-interest-value").text() : "";
           
           var selectedInterest = "";
           
           //handle changes in values
           $(this).find("input[name='00N60000002dF3Q']").change(function(){
               
               var newInterestValue = hiddenInterestValue;
               $(this).parents("form").find("input[name='00N60000002dF3Q']:checked").each(function(){
                   newInterestValue += (newInterestValue == "" ? "" : ",") + $(this).val();
               });
               
               $(this).parents("form").find("input[name='00N60000002FMQr']").val(newInterestValue);
           });
       }
       try
       {
       if($formContainer.find("input[name='00N60000002EtHl'][type='checkbox']").length > 0)
       {
           //ELD mandate
           if(window.location.hostname.indexOf(".co.uk") !== -1)
           {
               //UK
               $formContainer.find("input[name='00N60000002EtHl'][type='checkbox']").parents(".custom-field-row").hide();
           }else
           {
               //US
               $formContainer.find(".newsletter-row").hide();
           }
       }
       }catch(err)
       {
           console.log(err);
       }
       //E-LOGS
       if(teletracForms.showELogsSelection)
       {
           $(this).find(".interest-selection-elogs").show();
       }
       if(window.location.href.indexOf("elogs") > -1)
       {
           $formContainer.find("form").append('<!-- HOS - dynamically inserted--> <input name="00N60000002EtHl" type="hidden" value="1">');
       }

       teletracForms.initPopups($(this).attr("data-form"));
       
       $(this).find("form").submit(function() {  
            return teletracForms.salesforce.validate(this);
       });
       
       if($(this).attr("data-interest").length > 0)
       {
        $(this).children().find("input[name='00N60000002dF3Q'][value='"+ $(this).attr("data-interest") +"']").attr("checked",true);
        $(this).children().find("input[name='00N60000002FMQr'][value='"+ $(this).attr("data-interest") +"']").attr("checked",true);
       }
       
       
       //set to UK if on .co.uk domain
       if(window.location.hostname.indexOf(".co.uk") !== -1)
       {
           $(this).find("#country").val("UK");
       }
    });
    
    /* Prefill Form Data */
    var gclId = $.cookie("gclId");
	if (gclId != null) {
		$("input[name='00N60000002g7pD']").val(decodeURIComponent(gclId));
	}
	var landingPage = $.cookie("landingPage");
	if (landingPage != null) {
		$("input[name='00N60000002dF3f']").val(decodeURIComponent(landingPage));
	}
    $("input[name='00N60000002dF3p']").val(window.location.origin + window.location.pathname);
	var trackingCode = $.cookie("trackingCode");
	if (trackingCode != null) {
		$("input[name='00N60000002dF3u']").val(decodeURIComponent(trackingCode));
        }
        var tcCode = $.cookie("tcCode");
	if (tcCode != null) {
		$("input[name='00N60000002DVn8']").val(decodeURIComponent(tcCode));
        }
        var fleetType = $.cookie("fleetType");
        if (fleetType != null) {
           $("input[name='00N60000002dF3a']").val(decodeURIComponent(fleetType));
        }
        var ipAddress = "";
        $.ajax({
          url: "http://origin.www.teletrac.com/admin/services/teletrac/1.0.0.0/getipjsonp",
                dataType: "jsonp",
                type: "GET",
                async: false,
                success: function (d) {
                    ipAddress = d.ipAddress;
                    $("input[name='00N60000002FMKZ']").val(d.ipAddress);
                }
        });
        
        /* interest check scripts removed, value now set in hidden field
        $("input[name='00N60000002dF3Q']").click(function() {
          if ($(this).val() == "MarketUpdates") {
            if ($(this).is(":checked")) {
              $("input[name='00N60000002dF3L']").val(0);
            }
            else {
              $("input[name='00N60000002dF3L']").val(1);
            }
          }
          
          if($(this).is(":checked"))
          {
              $(this).parent().children("input[name='00N60000002FMQr'][value='"+ $(this).val() +"']").attr("checked",true);
          }
          else
          {
              $(this).parent().children("input[name='00N60000002FMQr'][value='"+ $(this).val() +"']").removeAttr("checked");
          }
        });*/
        var ukPattern = "-uk";
        try
        {
            if (window.location.href.indexOf(ukPattern, window.location.href - ukPattern.length) !== -1) {
              //$("#phone").mask("9999 999 9999");
              $("input[name='phone']:not([placeholder])").attr("placeholder","Area Code + Phone Number");
            }
            else {
              //$("#phone").mask("(999) 999-9999");
              $("input[name='phone']:not([placeholder])").attr("placeholder","Area Code + Phone Number");
            }
        }catch(err) {
            console.log("Error setting phone placeholders");
        }
        
        $("input[name='00N60000002fz6Z']").val(teletracForms.getOptimizelyVal());	
}

teletracForms.salesforce.validate = function(form)
{
    var formEmail = "";
    try
    {
        formEmail = $(form).find("#email").val();
    }catch(err){ }
    
      var message = "";
      if ($.trim($(form).find("#first_name").val()) == "" && $(form).find("#first_name").val() != "First Name1:*") {
         message += "First Name is required.\n"; 
      }
      if ($.trim($(form).find("#last_name").val()) == "" && $(form).find("#last_name").val() != "Last Name1:*") {
         message += "Last Name is required.\n"; 
      }
      if ($.trim($(form).find("#company").val()) == ""  && $(form).find("#company").val() != "Company1:*" && !$(form).find("#company").hasClass("optional")) {
         message += "Company is required.\n"; 
      }
    
      if ($.trim($(form).find("input[name='00N60000002E8rb']").val()) == "" && !$(form).find("input[name='00N60000002E8rb']").hasClass("optional")) {
         message += "Fleet Size is required.\n"; 
      }
      if ($(form).find("#email").val() == "") {
         message += "Email is required.\n"; 
      }
      else {
        var re = /\S+@\S+\.\S+/;
        if (!re.test($(form).find("#email").val())) {
          message += "Email is invalid.\n";
        }
      }
      if ($(form).find("#phone").val() == "" && !$(form).find("#phone").hasClass("optional")) {
         message += "Phone is required.\n"; 
      }
      //validation for no phone mask
      else if ($(form).find("#phone").val().replace(/-/g,'').replace(/\(|\)/g,'').replace(/\./g,'').replace(' ','').length < 10) {
        message += "Phone is invalid.\n";
      }
      
      if($(form).find("input[name='00N60000002EtHl'][type='checkbox']").is(":checked"))
      {
          $(form).find("input[name='00N60000002EtHl'][type='checkbox']").val("1");
      }else
      {
          $(form).find("input[name='00N60000002EtHl'][type='checkbox']").val("0");
      }
      
      //general forced Interest value
      try
      {
      if($(form).find("input[name='FormInterestHidden']").length > 0)
      {
          if($(form).find("input[name='FormInterestHidden']").val() != "")
          {
              var currentVal = $(form).find("input[name='00N60000002FMQr']").val();
              currentVal = currentVal == "" ? currentVal : currentVal + ",";
              $(form).find("input[name='00N60000002FMQr']").val(currentVal + $(form).find("input[name='FormInterestHidden']").val());
          }
      }
      }catch(err)
      {
          console.log(err);
      }
      
      //custom Interest value based on dynamic checkboxes
      try
      {
            var newVals = "";
            $(form).find(".custom-field-row input[type='checkbox']:checked").each(function(){
                newVals = $(this).attr("data-interest") + ",";
            });
            
            $(form).find("input[name='00N60000002FMQr']").val(newVals + $(form).find("input[name='00N60000002FMQr']").val());
      }catch(err)
      {
          console.log(err);
      }
      
      /*conditional for now while in testing*/
      if($(form).find("#human").length > 0)
      {
          if($.trim($(form).find("#human").val()) == "")
          {
            message += "Please answer the math question.\n"; 
          }else if($.trim($(form).find("#human").val()) != $("#" + answerGuid).val())
          {
            message += "Math question answer incorrect.\n"; 
          }
      }
    
      
      if (message != "") {
        message = "Please correct the following issues and submit again:\n\n" + message;
        
        try
        {
            var enteredValues = "FirstName: " + $(form).find("#first_name").val() + "\nLastName: " + $(form).find("#last_name").val() + "\nCompany: " + $(form).find("#company").val() + "\nFleetSize: " + $(form).find("input[name='00N60000002E8rb']").val() + "\nEmail: " + $(form).find("#email").val() + "\nPhone: " + $(form).find("#phone").val();
            teletracForms.log("2","Submit Validation Error", $(form).find("#email").val(), message + "\n\nVALUES\n" + enteredValues);
        }
        catch(err) { }
        
        alert(message);
        
        return false;
      }
      
      
    //append to return url
    var returnUrl = "http://www.teletrac.com/confirmation";
    try
    {
        returnUrl = $(form).find("input[name='retURL']").val();
        if(returnUrl == "")
        {
            returnUrl = "http://www.teletrac.com/confirmation";
        }
        returnUrl = returnUrl + "?email=" + $(form).find("#email").val();
    }
    catch(err)
    {
        console.log("Error setting return url.");    
    }
    
    try
    {
        if($(form).parents("div[data-role='form-salesforce']").attr("data-form") == "cta-download")
        {
            returnUrl = returnUrl + "&item=" + $(form).find("input[name='download-group']").val();
        }
    }catch(err)
    {
        console.log("Error setting return url for downloads.");    
    }
    
    $(form).find("input[name='retURL']").val(returnUrl);
      
    try
    {
        var cookieDomain = ".teletrac.com";
        if(window.location.hostname.indexOf(".co.uk") !== -1)
        {
          cookieDomain = ".teletrac.co.uk";
        }
    
        $.cookie("tt.sf", "1", { expires: new Date((new Date()).getTime() + (1000 * 60)), path: '/', domain: cookieDomain });
    }
    catch(err)
    {
      console.log("Error setting cookies.");  
    }
      
    return true;
}


/* PARDOT */
teletracForms.pardot.init = function()
{
     /* Attach Click Events */
    $("div[data-role='form-pardot']").each(function(){
        var $formDiv = $(this);
        $(this).attr("id","form_" + $(this).attr("data-form"));
        
        
       teletracForms.initPopups($(this).attr("data-form"));
    });
    
      var landingPage = $.cookie("landingPage");
      if (landingPage != null) {
          $(".mkt-entry-page > input[type='hidden']").val(decodeURIComponent(landingPage));
      }
      
      var trackingCode = $.cookie("trackingCode");
      if (trackingCode != null) {
        $(".mkt-code > input[type='hidden']").val(decodeURIComponent(trackingCode));
      }
      
      var leadPage = $.cookie("leadPage");
      if (leadPage != null) {
        $(".mkt-lead-page > input[type='hidden']").val(decodeURIComponent(leadPage));
      }
      
      var tcCode = $.cookie("tcCode");
      if (tcCode != null) {
        $(".tracking-code > input[type='hidden']").val(decodeURIComponent(tcCode));
      }
      
      var gclId = $.cookie("gclId");
      if (gclId != null) {
        $(".gc-lid > input").val(decodeURIComponent(gclId));
      }
      
      if($(".ip-address").length > 0)
      {
        var ipAddress = "";
        $.ajax({
          url: "http://origin.www.teletrac.com/admin/services/teletrac/1.0.0.0/getipjsonp",
          dataType: "jsonp",
          type: "GET",
          async: false,
          success: function (d) {
            ipAddress = d.ipAddress;
            $(".ip-address > input[type='hidden']").val(d.ipAddress);
          }
        });
      }
      
      $(".Optimizely > input[type='hidden']").val(teletracForms.getOptimizelyVal());
      
      
}

function checkOptOut(isChecked, e)
{
    //I'm not sure why we would need this, but the forms hardcode this into them
}
