import java.nio.file.*;
import java.sql.*;
import java.util.*;

public class RunSqlFileSmart {
  static List<String> splitSql(String sql) {
    List<String> statements = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    boolean inSingle = false;
    boolean inLineComment = false;
    for (int i = 0; i < sql.length(); i++) {
      char c = sql.charAt(i);
      char next = i + 1 < sql.length() ? sql.charAt(i + 1) : '\0';
      if (inLineComment) {
        if (c == '\n' || c == '\r') {
          inLineComment = false;
          current.append(c);
        }
        continue;
      }
      if (!inSingle && c == '-' && next == '-') {
        inLineComment = true;
        i++;
        continue;
      }
      if (c == '\'' && (i == 0 || sql.charAt(i - 1) != '\\')) {
        inSingle = !inSingle;
        current.append(c);
        continue;
      }
      if (c == ';' && !inSingle) {
        String statement = current.toString().trim();
        if (!statement.isEmpty()) statements.add(statement);
        current.setLength(0);
        continue;
      }
      current.append(c);
    }
    String trailing = current.toString().trim();
    if (!trailing.isEmpty()) statements.add(trailing);
    return statements;
  }

  public static void main(String[] args) throws Exception {
    String sql = Files.readString(Path.of(args[3]));
    try (Connection connection = DriverManager.getConnection(args[0], args[1], args[2]);
         Statement statement = connection.createStatement()) {
      for (String command : splitSql(sql)) {
        statement.execute(command);
      }
    }
  }
}
