import java.nio.file.*;
import java.sql.*;

public class RunSqlFile {
  public static void main(String[] args) throws Exception {
    String url = args[0];
    String user = args[1];
    String password = args[2];
    String sql = Files.readString(Path.of(args[3]));
    try (Connection connection = DriverManager.getConnection(url, user, password);
         Statement statement = connection.createStatement()) {
      for (String part : sql.split(";")) {
        String command = part.replaceAll("(?m)^\\s*--.*$", "").trim();
        if (!command.isEmpty()) {
          statement.execute(command);
        }
      }
    }
  }
}
