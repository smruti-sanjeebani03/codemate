package com.codemate.service;

import com.codemate.dto.CreateProblemRequest;
import com.codemate.dto.ProblemResponse;
import com.codemate.dto.UpdateProblemRequest;
import com.codemate.entity.AuthProvider;
import com.codemate.entity.Category;
import com.codemate.entity.Difficulty;
import com.codemate.entity.Problem;
import com.codemate.entity.User;
import com.codemate.repository.ProblemRepository;
import com.codemate.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProblemServiceTest {

    @Mock
    private ProblemRepository problemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PlatformDetectionService platformDetectionService;

    @InjectMocks
    private ProblemService problemService;

    private User userA;
    private User userB;
    private Problem problemA;

    @BeforeEach
    void setUp() {
        userA = new User();
        userA.setId(1L);

        userB = new User();
        userB.setId(2L);

        problemA = new Problem();
        problemA.setId(100L);
        problemA.setUser(userA);
        problemA.setTitle("Test Problem");
        problemA.setProblemUrl("https://leetcode.com/problems/test-problem/");
        problemA.setPlatform("LeetCode");
        problemA.setCategory(Category.DSA);
        problemA.setTopic("Arrays");
        problemA.setDifficulty(Difficulty.EASY);
        problemA.setProgrammingLanguage("Java");
        problemA.setSolvedAt(Instant.now());
        problemA.setCreatedAt(Instant.now());
        problemA.setUpdatedAt(Instant.now());
    }

    @Test
    @DisplayName("Should create problem with auto platform detection for authenticated user")
    void testCreateProblem() {
        CreateProblemRequest request = new CreateProblemRequest(
            problemA.getTitle(),
                "https://leetcode.com/problems/two-sum/",
                Category.DSA,
                "Arrays",
                Difficulty.EASY,
                "Java",
                Instant.now());

        when(userRepository.findById(1L)).thenReturn(Optional.of(userA));
        when(platformDetectionService.detectPlatform("https://leetcode.com/problems/two-sum/")).thenReturn("LeetCode");
        when(problemRepository.save(any(Problem.class))).thenAnswer(invocation -> {
            Problem p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        ProblemResponse response = problemService.createProblem(1L, request);

        assertNotNull(response);
        assertEquals(problemA.getTitle(), response.getTitle());
        assertEquals("LeetCode", response.getPlatform());
        assertEquals(Category.DSA, response.getCategory());
        assertEquals("Arrays", response.getTopic());
        assertEquals(Difficulty.EASY, response.getDifficulty());
        assertEquals("Java", response.getProgrammingLanguage());
        assertEquals(1L, response.getUserId());
    }

    @Test
    @DisplayName("User A can view their own problem")
    void testGetOwnProblem() {
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));

        ProblemResponse response = problemService.getProblemById(1L, 100L);
        assertNotNull(response);
        assertEquals(problemA.getTitle(), response.getTitle());
    }

    @Test
    @DisplayName("User B attempting to view User A's problem is REJECTED with 403 AccessDeniedException")
    void testCrossUserAccessBlocked() {
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));

        assertThrows(AccessDeniedException.class, () -> {
            problemService.getProblemById(2L, 100L); // User B (id=2) accessing problem owned by User A (id=1)
        });
    }

    @Test
    @DisplayName("User B attempting to update User A's problem is REJECTED with AccessDeniedException")
    void testCrossUserUpdateBlocked() {
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));

        UpdateProblemRequest updateReq = new UpdateProblemRequest();
        updateReq.setTitle("Malicious Title Tamper");

        assertThrows(AccessDeniedException.class, () -> {
            problemService.updateProblem(2L, 100L, updateReq);
        });

        verify(problemRepository, never()).save(any());
    }

    @Test
    @DisplayName("User B attempting to delete User A's problem is REJECTED with AccessDeniedException")
    void testCrossUserDeleteBlocked() {
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));

        assertThrows(AccessDeniedException.class, () -> {
            problemService.deleteProblem(2L, 100L);
        });

        verify(problemRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Owner can update their problem and trigger platform re-detection on URL change")
    void testOwnerCanUpdate() {
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));
        when(platformDetectionService.detectPlatform("https://codeforces.com/problemset/problem/1/A"))
                .thenReturn("Codeforces");
        when(problemRepository.save(any(Problem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateProblemRequest updateReq = new UpdateProblemRequest();
        updateReq.setTitle("Theatre Square");
        updateReq.setProblemUrl("https://codeforces.com/problemset/problem/1/A");
        updateReq.setCategory(Category.LOGIC);
        updateReq.setTopic("Mathematical Logic");

        ProblemResponse updated = problemService.updateProblem(1L, 100L, updateReq);

        assertEquals("Theatre Square", updated.getTitle());
        assertEquals("Codeforces", updated.getPlatform());
        assertEquals(Category.LOGIC, updated.getCategory());
        assertEquals("Mathematical Logic", updated.getTopic());
    }

    @Test
    @DisplayName("Owner can delete their problem")
    void testOwnerCanDelete() {
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));

        problemService.deleteProblem(1L, 100L);

        verify(problemRepository, times(1)).delete(problemA);
    }

    @Test
    @DisplayName("User A and User B Data Isolation: User A cannot access User B's problem and vice versa")
    void testBidirectionalUserIsolation() {
        Problem problemB = new Problem();
        problemB.setId(200L);
        problemB.setUser(userB);
        problemB.setTitle("Course Schedule");
        problemB.setCategory(Category.DSA);
        problemB.setDifficulty(Difficulty.MEDIUM);
        problemB.setProgrammingLanguage("C++");

        when(problemRepository.findById(200L)).thenReturn(Optional.of(problemB));
        when(problemRepository.findById(100L)).thenReturn(Optional.of(problemA));

        // 1. User A (id=1) cannot GET User B's problem (id=200)
        assertThrows(AccessDeniedException.class, () -> {
            problemService.getProblemById(1L, 200L);
        });

        // 2. User A (id=1) cannot PUT User B's problem (id=200)
        UpdateProblemRequest tamperRequest = new UpdateProblemRequest();
        tamperRequest.setTitle("User A Tampered Title");
        assertThrows(AccessDeniedException.class, () -> {
            problemService.updateProblem(1L, 200L, tamperRequest);
        });

        // 3. User A (id=1) cannot DELETE User B's problem (id=200)
        assertThrows(AccessDeniedException.class, () -> {
            problemService.deleteProblem(1L, 200L);
        });

        // 4. User B (id=2) cannot GET User A's problem (id=100)
        assertThrows(AccessDeniedException.class, () -> {
            problemService.getProblemById(2L, 100L);
        });

        // 5. User B (id=2) cannot PUT User A's problem (id=100)
        assertThrows(AccessDeniedException.class, () -> {
            problemService.updateProblem(2L, 100L, tamperRequest);
        });

        // 6. User B (id=2) cannot DELETE User A's problem (id=100)
        assertThrows(AccessDeniedException.class, () -> {
            problemService.deleteProblem(2L, 100L);
        });

        // Verify repository was never called to mutate unowned records
        verify(problemRepository, never()).delete(problemB);
    }
}
