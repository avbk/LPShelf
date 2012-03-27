/**
 * µ-Template Engine: A very simple Template Engine.
 *
 * It can evaluate Javascript Code in the templates.
 * 
 * @param templateDir         The base directory of the templates
 */
function TemplateEngine(templateDir) {
    if (templateDir[templateDir.length-1] != '/')
        templateDir += '/';
    
    /**
     * Loads a template and evaluates the javascript commands
     * included in it. The javascript commands have to be written
     * between <b>«</b> and <b>»</b>.
     * 
     * 
     * @param templateName    The name of the template file without the <i>.html</i> suffix
     * @param µ               The data, which should be accessable in the template. It
     *                        can be accessed by prepending <i>data.</i>
     * @param callback        The callback function. Its first 
     *                        parameter will be the evaluated template
     */
    this.load = function(templateName, µ, callback) {
        $.ajax({
            url: templateDir +templateName + ".html", 
            dataType : 'text', 
            success: function (result) {
                callback(result.replace(RegExp("«(.*?)»", "gm"), function(voidParam, js) {
                    return eval(js);
                }));
            }
        });
    }
}