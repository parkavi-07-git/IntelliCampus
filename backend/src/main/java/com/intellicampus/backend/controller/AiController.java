package com.intellicampus.backend.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AiController {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /*
     * ============================================================
     * GEMINI API KEY
     * ============================================================
     *
     * Paste your NEW Gemini API key between the quotes.
     *
     * DO NOT put this key inside StudentDashboard.jsx.
     *
     * Example:
     *
     * private static final String GEMINI_API_KEY =
     *         "AIzaSyxxxxxxxxxxxxxxxx";
     *
     */

    private static final String GEMINI_API_KEY = System.getenv("GOOGLE_API_KEY");


    /*
     * ============================================================
     * MAIN AI CHAT ENDPOINT
     * ============================================================
     */

    @PostMapping("/chat")
    public ResponseEntity<?> chat(
            @RequestBody Map<String, Object> request
    ) {

        try {

            String message = String.valueOf(
                    request.getOrDefault("message", "")
            ).trim();

            String studentContext = String.valueOf(
                    request.getOrDefault("studentContext", "")
            );

            if (message.isEmpty()) {

                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "message", "Please enter a message."
                        )
                );
            }


            /*
             * Check API key
             */

            if (
                    GEMINI_API_KEY == null
                            || GEMINI_API_KEY.isBlank()
                            || GEMINI_API_KEY.equals(
                                    "PASTE_YOUR_NEW_GEMINI_API_KEY_HERE"
                            )
            ) {

                return ResponseEntity.status(
                        HttpStatus.INTERNAL_SERVER_ERROR
                ).body(
                        Map.of(
                                "success", false,
                                "message",
                                "Gemini API key is not configured."
                        )
                );
            }


            /*
             * Build intelligent student-aware prompt
             */

            String prompt = buildPrompt(
                    message,
                    studentContext
            );


            /*
             * Call Gemini ONCE.
             *
             * No slow model switching.
             * No 1/3 retry system.
             */

            String aiResponse = callGemini(
                    prompt,
                    GEMINI_API_KEY
            );


            /*
             * Successful response
             */

            if (
                    aiResponse != null
                            && !aiResponse.isBlank()
            ) {

                return ResponseEntity.ok(
                        Map.of(
                                "success", true,
                                "response", aiResponse
                        )
                );
            }


            /*
             * Gemini returned no usable answer
             */

            return ResponseEntity.status(
                    HttpStatus.SERVICE_UNAVAILABLE
            ).body(
                    Map.of(
                            "success", false,
                            "message",
                            "Gemini is temporarily unavailable. Please try again."
                    )
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(
                    HttpStatus.INTERNAL_SERVER_ERROR
            ).body(
                    Map.of(
                            "success", false,
                            "message",
                            "AI Assistant could not process your request."
                    )
            );
        }
    }


    /*
     * ============================================================
     * BUILD AI PROMPT
     * ============================================================
     */

    private String buildPrompt(
            String message,
            String studentContext
    ) {

        return """
                You are IntelliCampus AI Assistant 🤖.

                You are a smart, friendly and reliable academic
                assistant for a college student.

                Your job is to help the student with:

                - Study plans
                - Exam preparation
                - Courses
                - Marks
                - Attendance
                - Timetables
                - Academic improvement
                - Learning strategies
                - Time management
                - Programming and technical subjects
                - Placement preparation
                - General academic guidance

                ====================================================
                STUDENT INFORMATION
                ====================================================

                %s

                ====================================================
                STUDENT QUESTION
                ====================================================

                %s

                ====================================================
                IMPORTANT RULES
                ====================================================

                1. Answer the student's actual question directly.

                2. Use the student's information when it is relevant.

                3. NEVER invent marks, attendance, courses,
                   timetable entries or other personal academic data.

                4. If required student information is unavailable,
                   clearly say that it is unavailable.

                5. Give practical and actionable answers.

                6. Keep answers easy to understand.

                7. Use headings or bullet points when they improve
                   readability.

                8. For study plans, provide realistic schedules.

                9. For marks questions, calculate carefully.

                10. For attendance questions, use only the attendance
                    information actually provided.

                11. For programming or technical questions, explain
                    clearly and give examples when useful.

                12. Be supportive and natural.

                13. Do not unnecessarily repeat the student's question.

                14. Do not say that you are waiting, retrying,
                    switching models, or checking the API.

                15. Respond like a real academic AI assistant.

                16. For simple questions, keep the answer concise.

                17. For complex questions, give a structured,
                    detailed answer.

                Now answer the student's question.
                """.formatted(
                studentContext,
                message
        );
    }


    /*
     * ============================================================
     * CALL GEMINI
     * ============================================================
     */

    private String callGemini(
            String prompt,
            String apiKey
    ) throws Exception {


        /*
         * Current stable Gemini Flash model
         */

        String model = "gemini-3.5-flash-lite";


        String url =
                "https://generativelanguage.googleapis.com/v1beta/models/"
                        + model
                        + ":generateContent";


        /*
         * ========================================================
         * TEXT PART
         * ========================================================
         */

        Map<String, Object> textPart =
                new HashMap<>();

        textPart.put(
                "text",
                prompt
        );


        /*
         * ========================================================
         * CONTENT
         * ========================================================
         */

        Map<String, Object> content =
                new HashMap<>();

        content.put(
                "parts",
                new Object[]{
                        textPart
                }
        );


        /*
         * ========================================================
         * GENERATION CONFIG
         * ========================================================
         *
         * LOW thinking = faster responses.
         *
         * Gemini 3.8 Flash supports:
         *
         * low
         * medium
         * high
         *
         * We use LOW because IntelliCampus is a
         * real-time student assistant.
         */

        Map<String, Object> thinkingConfig =
                new HashMap<>();

        thinkingConfig.put(
                "thinkingLevel",
                "low"
        );


        Map<String, Object> generationConfig =
                new HashMap<>();
        
        generationConfig.put("maxOutputTokens", 512);

        generationConfig.put(
                "thinkingConfig",
                thinkingConfig
        );


        /*
         * ========================================================
         * FINAL REQUEST BODY
         * ========================================================
         */

        Map<String, Object> requestBody =
                new HashMap<>();

        requestBody.put(
                "contents",
                new Object[]{
                        content
                }
        );

        requestBody.put(
                "generationConfig",
                generationConfig
        );


        String jsonBody =
                objectMapper.writeValueAsString(
                        requestBody
                );


        /*
         * ========================================================
         * HTTP REQUEST
         * ========================================================
         */

        HttpRequest request =
                HttpRequest.newBuilder()
                        .uri(
                                URI.create(url)
                        )
                        .timeout(
                                Duration.ofSeconds(30)
                        )
                        .header(
                                "Content-Type",
                                "application/json"
                        )
                        .header(
                                "x-goog-api-key",
                                apiKey
                        )
                        .POST(
                                HttpRequest.BodyPublishers.ofString(
                                        jsonBody
                                )
                        )
                        .build();


        System.out.println();
        System.out.println(
                "=========================================="
        );

        System.out.println(
                "Sending request to Gemini..."
        );

        System.out.println(
                "Model: " + model
        );

        System.out.println(
                "Thinking level: LOW"
        );

        System.out.println(
                "=========================================="
        );


        /*
         * ========================================================
         * SEND REQUEST
         * ========================================================
         */

        HttpResponse<String> response =
                httpClient.send(
                        request,
                        HttpResponse.BodyHandlers.ofString()
                );


        System.out.println(
                "Gemini HTTP Status: "
                        + response.statusCode()
        );


        /*
         * ========================================================
         * HANDLE API ERRORS
         * ========================================================
         */

        if (response.statusCode() != 200) {

            System.out.println(
                    "Gemini API Error:"
            );

            System.out.println(
                    response.body()
            );


            /*
             * Return null immediately.
             *
             * IMPORTANT:
             * No retry loop.
             */

            if (
                    response.statusCode() == 429
                            || response.statusCode() == 500
                            || response.statusCode() == 502
                            || response.statusCode() == 503
                            || response.statusCode() == 504
            ) {

                return null;
            }


            throw new RuntimeException(
                    "Gemini API error: "
                            + response.body()
            );
        }


        /*
         * ========================================================
         * PARSE GEMINI RESPONSE
         * ========================================================
         */

        JsonNode root =
                objectMapper.readTree(
                        response.body()
                );


        JsonNode candidates =
                root.path("candidates");


        if (
                candidates.isArray()
                        && candidates.size() > 0
        ) {

            JsonNode parts =
                    candidates
                            .get(0)
                            .path("content")
                            .path("parts");


            if (
                    parts.isArray()
                            && parts.size() > 0
            ) {

                StringBuilder finalText =
                        new StringBuilder();


                /*
                 * Gemini may return multiple text parts.
                 *
                 * Combine them safely.
                 */

                for (JsonNode part : parts) {

                    String text =
                            part.path("text")
                                    .asText("");


                    if (
                            text != null
                                    && !text.isBlank()
                    ) {

                        if (
                                finalText.length() > 0
                        ) {

                            finalText.append("\n");
                        }

                        finalText.append(text);
                    }
                }


                if (
                        finalText.length() > 0
                ) {

                    System.out.println(
                            "Gemini response received successfully."
                    );

                    return finalText.toString().trim();
                }
            }
        }


        /*
         * No usable text found.
         */

        System.out.println(
                "Gemini returned an empty response."
        );

        return null;
    }
}