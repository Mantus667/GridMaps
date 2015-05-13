using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Umbraco.Core;
using Umbraco.Core.Logging;

namespace GridMaps
{
    public class StartUp : ApplicationEventHandler
    {
        protected override void ApplicationStarted(UmbracoApplicationBase umbracoApplication, ApplicationContext applicationContext)
        {
            try
            {
                var src = HttpContext.Current.Server.MapPath("~/App_Plugins/GridMaps/Config/editor.json");
                var trg = HttpContext.Current.Server.MapPath("~/config/grid.editors.config.js");

                if (File.Exists(src) && File.Exists(trg))
                {
                    var srcJson = File.ReadAllText(src);
                    var trgJson = File.ReadAllText(trg);

                    if (!string.IsNullOrWhiteSpace(srcJson))
                    {
                        var srcObj = JsonConvert.DeserializeObject<JObject>(srcJson);
                        var trgArr = JsonConvert.DeserializeObject(trgJson) as JArray ?? new JArray();

                        if (srcObj != null)
                        {
                            if (!trgArr.Any(x => x["alias"].Value<string>() == srcObj["alias"].Value<string>()))
                            {
                                trgArr.Add(srcObj);
                                File.WriteAllText(trg, JsonConvert.SerializeObject(trgArr, Formatting.Indented), Encoding.UTF8);
                                LogHelper.Info<StartUp>("[GridMaps] Done editing grid editor config.");
                            }                            
                        }
                    }
                }
                LogHelper.Info<StartUp>("[GridMaps] Editor file not found.");
            }
            catch (Exception ex)
            {
                LogHelper.Error<StartUp>("[GridMaps] Error merging grid editor config.", ex);
            }
            base.ApplicationStarted(umbracoApplication, applicationContext);
        }
    }
}
