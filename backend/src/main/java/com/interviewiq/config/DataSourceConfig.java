package com.interviewiq.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:root}")
    private String username;

    @Value("${spring.datasource.password:root123}")
    private String password;

    @Value("${spring.datasource.driver-class-name:com.mysql.cj.jdbc.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        String finalUrl = rawUrl;
        String finalUser = username;
        String finalPass = password;

        if (rawUrl != null && rawUrl.startsWith("mysql://")) {
            logger.info("Detected raw 'mysql://' URI scheme. Normalizing into standard JDBC format...");
            try {
                URI uri = URI.create(rawUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] userParts = userInfo.split(":", 2);
                    finalUser = userParts[0];
                    finalPass = userParts[1];
                }
                String host = uri.getHost();
                int port = uri.getPort() != -1 ? uri.getPort() : 3306;
                String path = uri.getPath() != null ? uri.getPath() : "/defaultdb";
                String query = uri.getQuery();

                StringBuilder queryBuilder = new StringBuilder();
                if (query != null && !query.isEmpty()) {
                    query = query.replace("ssl-mode=REQUIRED", "sslMode=REQUIRED")
                                 .replace("ssl-mode=required", "sslMode=REQUIRED")
                                 .replace("ssl-mode=preferred", "sslMode=PREFERRED")
                                 .replace("ssl-mode=disabled", "sslMode=DISABLED");
                    queryBuilder.append(query);
                } else {
                    queryBuilder.append("sslMode=REQUIRED");
                }

                if (!queryBuilder.toString().contains("allowPublicKeyRetrieval")) {
                    queryBuilder.append("&allowPublicKeyRetrieval=true");
                }
                if (!queryBuilder.toString().contains("serverTimezone")) {
                    queryBuilder.append("&serverTimezone=UTC");
                }

                finalUrl = "jdbc:mysql://" + host + ":" + port + path + "?" + queryBuilder.toString();
                logger.info("Successfully normalized JDBC URL: jdbc:mysql://{}:{}{}", host, port, path);
            } catch (Exception e) {
                logger.warn("Could not parse URI: {}. Falling back to 'jdbc:' prefix.", e.getMessage());
                finalUrl = "jdbc:" + rawUrl;
            }
        }

        config.setJdbcUrl(finalUrl);
        config.setUsername(finalUser);
        config.setPassword(finalPass);
        config.setDriverClassName(driverClassName);
        config.setMaximumPoolSize(20);
        config.setMinimumIdle(5);
        config.setIdleTimeout(300000);
        config.setConnectionTimeout(20000);

        return new HikariDataSource(config);
    }
}
