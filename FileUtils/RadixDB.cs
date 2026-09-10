using System;
using MySql.Data.MySqlClient;


public class RadixDB {


    public RadixFileInfo GetFileInfo(string fileId) {
        string connectionString = "Server=localhost;Port=3306;Database=towercom;Uid=peppo;Pwd=p3pp0;";

        RadixFileInfo info = null;
        using (var connection = new MySqlConnection(connectionString)) {
            try {
                connection.Open();
                string query = $"SELECT * FROM files where id = {fileId}";

                using (var command = new MySqlCommand(query, connection))
                using (var reader = command.ExecuteReader()) {
                    while (reader.Read()) {
                        info = new RadixFileInfo();
                        // Adjust column names/types to match your customer table schema
                        info.ID = Convert.ToInt64(reader["id"]);
                        info.Name = (string)reader["name"];
                        info.Type = (int)reader["filetype_id"];
                        if (reader["description"] is not System.DBNull) {
                            info.Description = System.Text.Encoding.UTF8.GetString((System.Byte[])reader["description"]);
                        }
                        if (reader["submitted"] is not System.DBNull) {
                            info.Submitted = DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(reader["submitted"])).DateTime;
                        }
                        if (reader["deleted"] is not System.DBNull) {
                            info.Deleted = (bool)reader["deleted"];
                        }

                        // Console.WriteLine($"{reader["id"]} | {reader["filetype_id"]} | {reader["name"]} | {DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(reader["submitted"])).DateTime}");

                    }
                }
            } catch (MySqlException ex) {
                Console.WriteLine($"Error: {ex.Message}");
            }
        }

        if (info == null) { throw new Exception($"No Radif File record found for ID: {fileId}"); }

        return info;
    }
}


public class RadixFileInfo {
    public long ID { get; set; }
    public int Type { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public DateTime Submitted { get; set; }
    public bool Deleted { get; set; }
}