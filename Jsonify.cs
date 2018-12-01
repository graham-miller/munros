using System.Collections.Generic;
using System.IO;
using System.Linq;
using CsvHelper;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace Jsonify
{
    class Program
    {
        private static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            Formatting = Newtonsoft.Json.Formatting.Indented,
            ContractResolver = new CamelCasePropertyNamesContractResolver()
        };

        static void Main(string[] args)
        {
            List<CsvRecord> records;

            using (var stream = new FileStream(@"C:\Users\gmiller\Desktop\Munros.csv", FileMode.Open))
            using (TextReader textReader = new StreamReader(stream))
            using (var csv = new CsvReader(textReader))
            {
                csv.Configuration.HeaderValidated = null;
                csv.Configuration.MissingFieldFound = null;
                records = csv.GetRecords<CsvRecord>().ToList();
            }

            var regions = records
                .Select(x => new
                {
                    Number = x.RegionNumber,
                    Name = x.RegionName,
                    Munros = records
                        .Where(y => y.RegionNumber == x.RegionNumber)
                        .Select(y => new
                        {
                            Rank = y.Rank,
                            Name = y.Name,
                            Meaning = y.Meaning,
                            Height = y.Height,
                            Latitude = y.Latitude,
                            Longitude = y.Longitude,
                            Climbed = y.Climbed
                        })
                        .OrderByDescending(y => y.Height)
                        .ToList()
                })
                .GroupBy(x => x.Number)
                .Select(group => group.First())
                .OrderBy(x => x.Number)
                .ToList();

            var json = JsonConvert.SerializeObject(regions, Settings);

            File.WriteAllText(@"C:\Users\gmiller\Desktop\Munros.json", json);
        }
    }

    internal struct CsvRecord
    {
        public int Rank { get; set; }
        public string Name { get; set; }
        public int RegionNumber { get; set; }
        public string RegionName { get; set; }
        public string Meaning { get; set; }
        public int Height { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool Climbed { get; set; }
    }
}
