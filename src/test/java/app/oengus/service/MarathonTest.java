package app.oengus.service;

import app.oengus.entity.model.Marathon;
import app.oengus.entity.model.User;
import app.oengus.service.repository.UserRepositoryService;
import app.oengus.spring.model.Role;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * TODO write test for "submitsOpen" -- should throw exception when submissions are closed
 */
// TODO figure out if Spring profile is needed here `@Profile("test")` or something
@SpringBootTest
@TestPropertySource("/test.properties")
@Transactional // so that everything is rolled back
class MarathonTest {

    private Logger logger = LoggerFactory.getLogger(MarathonTest.class);

    @Autowired
    private UserRepositoryService userRepositoryService;
    @Autowired
    private MarathonService marathonService;

    @Test
    void createMarathonTest() {
        User admin = createAdmin();
        Marathon m = new Marathon();
        m.setCreator(admin);
        m.setId("testId");
        m.setName("Test Marathon");
        ZonedDateTime startDate = ZonedDateTime.of(2122, 6, 1, 0, 0, 0, 0, ZoneId.of("UTC"));
        m.setStartDate(startDate);
        ZonedDateTime endDate = ZonedDateTime.of(2122, 7, 30, 0, 0, 0, 0, ZoneId.of("UTC"));
        m.setEndDate(endDate);
        m.setSubmissionsStartDate(startDate.minusMonths(4));
        m.setSubmissionsEndDate(startDate.minusMonths(2));
        m.setDescription("Marathon for testing.");

        Marathon createdMarathon = marathonService.create(m, admin);
        logger.info("Created a marathon: ID=" + createdMarathon.getId() + " name=" + createdMarathon.getName());
    }

    /**
     * Create a fake user to be used in testing.
     * Note that {@link UserService} does not support creating users other than through Discord/Twitch/Twitter logins.
     */
    private User createAdmin() {
        User admin = new User();
        admin.setEnabled(true);
        admin.setRoles(List.of(Role.ROLE_ADMIN, Role.ROLE_USER));
        admin.setUsername("testAdmin");
        admin.setMail("admin@example.org");
        admin.setDiscordId("fakeDiscordId");
        User adminWithId = userRepositoryService.save(admin);
        logger.info("Created user with ID=" + adminWithId.getId());
        return adminWithId;
    }
}
