/**
 * µ-Template Engine: A very simple Template Engine.
 *
 * It can evaluate Javascript Code in the templates.
 * 
 * @param templateDir         The base directory of the templates
 */
function TemplateEngine(templateDir, templateFiles, onReadyCallback) {
    if (templateDir[templateDir.length-1] != '/')
        templateDir += '/';
    
    if (typeof templateFiles == "string")
        templateFiles = [templateFiles];
    
    cache = {};
    __load = function (fileList) {
        if (fileList.length == 0)
            onReadyCallback();
        else {
            templateName = fileList.pop();
            $.ajax({
                url: templateDir +templateName + ".html", 
                dataType : 'text', 
                success: function (result) {
                    cache[templateName] = result;
                    __load(fileList);
                }
            });
        }
    }
    __load(templateFiles);
        
    
    /**
     * Loads a template and evaluates the javascript commands
     * included in it. The javascript commands have to be written
     * between <b>«</b> and <b>»</b>.
     * 
     * 
     * @param templateName    The name of the template file without the <i>.html</i> suffix
     * @param µ               The data, which should be accessable in the template. It
     *                        can be accessed by prepending <i>data.</i>
     *                        
     * @return                The processed template
     */
    this.load = function(templateName, µ) {
        if (templateName in cache) {
            return cache[templateName].replace(RegExp("«(.*?)»", "gm"), function(voidParam, js) {
                return eval(js);
            });
        } else {
            console.log("ERROR: template not found: " + templateName);
            return "";        
        }
    }
}