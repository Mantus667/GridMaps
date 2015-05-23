using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;
using System.Xml;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using umbraco.cms.businesslogic.packager.standardPackageActions;
using umbraco.interfaces;
using Umbraco.Core;
using Umbraco.Core.Logging;

namespace GridMaps
{
    public class GridMapsPackageAction : IPackageAction
    {
        public string Alias()
        {
            return "GridMapsPackageAction";
        }

        public System.Xml.XmlNode SampleXml()
        {
            var sample = string.Format(
                "<Action runat=\"install\" undo=\"true\" alias=\"{0}\" />",
                Alias());

            return helper.parseStringToXmlNode(sample);
        }

        public bool Execute(string packageName, System.Xml.XmlNode xmlData)
        {
            try
            {
                var src = HttpContext.Current.Server.MapPath("~/App_Plugins/GridMaps/Config/editor.json");
                var trg = HttpContext.Current.Server.MapPath("~/config/grid.editors.config.js");

                if (!File.Exists(src) && !File.Exists(trg))
                {
                    return false;
                }
                
                var srcJson = File.ReadAllText(src);
                var trgJson = File.ReadAllText(trg);

                if (String.IsNullOrWhiteSpace(srcJson))
                {
                    return false;
                }
                    
                var srcObj = JsonConvert.DeserializeObject<JObject>(srcJson);
                var trgArr = JsonConvert.DeserializeObject(trgJson) as JArray ?? new JArray();
                    
                if (srcObj == null)
                {
                    return false;
                }
                
                if (trgArr.Any(x => x["alias"].Value<string>() == srcObj["alias"].Value<string>()))
                {
                    return false;
                }

                trgArr.Add(srcObj);

                File.WriteAllText(trg, JsonConvert.SerializeObject(trgArr, Newtonsoft.Json.Formatting.Indented), Encoding.UTF8);

                LogHelper.Info<GridMapsPackageAction>("[GridMaps] Done editing grid editor config.");

                return true;
            }
            catch (Exception ex)
            {
                LogHelper.Error<GridMapsPackageAction>("[GridMaps] Error merging grid editor config.", ex);
                return false;
            }
        }        

        public bool Undo(string packageName, System.Xml.XmlNode xmlData)
        {
            try
            {
                var src = HttpContext.Current.Server.MapPath("~/App_Plugins/GridMaps/Config/editor.json");
                var trg = HttpContext.Current.Server.MapPath("~/config/grid.editors.config.js");

                if (!File.Exists(src) || !File.Exists(trg))
                    return false;

                var srcJson = File.ReadAllText(src);
                var trgJson = File.ReadAllText(trg);

                if (string.IsNullOrWhiteSpace(srcJson))
                    return false;

                var srcObj = JsonConvert.DeserializeObject(srcJson) as JObject;
                var trgArr = JsonConvert.DeserializeObject(trgJson) as JArray ?? new JArray();

                if (srcObj == null)
                    return false;

                var idx = trgArr.FindIndex(x => x["alias"] == srcObj["alias"]);
                if (idx >= 0)
                {
                    trgArr.RemoveAt(idx);

                    File.WriteAllText(trg, JsonConvert.SerializeObject(trgArr, Newtonsoft.Json.Formatting.Indented), Encoding.UTF8);
                }

                return true;
            }
            catch (Exception ex)
            {
                LogHelper.Error<GridMapsPackageAction>("[GridMaps] Error unmerging grid editor config.", ex);

                return false;
            }
        }
    }
}
