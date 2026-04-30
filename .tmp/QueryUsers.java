import java.sql.*;

public class QueryUsers {
  public static void main(String[] args) throws Exception {
    try (Connection c = DriverManager.getConnection(args[0], args[1], args[2]);
         PreparedStatement ps = c.prepareStatement("select u.id, u.email, u.enabled, u.suspended, left(u.password, 20) as hash_start, group_concat(r.roles) as roles from users u left join user_roles r on r.user_id = u.id where u.email in ('admin@insightnest.com','nusrat.jahan@insightnest.com','farhan.rahman@insightnest.com') group by u.id, u.email, u.enabled, u.suspended, u.password")) {
      ResultSet rs = ps.executeQuery();
      while (rs.next()) {
        System.out.println(rs.getLong("id") + " | " + rs.getString("email") + " | enabled=" + rs.getBoolean("enabled") + " | suspended=" + rs.getBoolean("suspended") + " | hash=" + rs.getString("hash_start") + " | roles=" + rs.getString("roles"));
      }
    }
  }
}
