import java.nio.file.*;
import java.sql.*;

public class RunSqlFileOptionalPassword {
  public static void main(String[] args) throws Exception {
    String url = args[0];
    String user = args[1];
    String password = args.length == 3 ? "" : args[2];
    String path = args.length == 3 ? args[2] : args[3];
    String sql = Files.readString(Path.of(path));
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
