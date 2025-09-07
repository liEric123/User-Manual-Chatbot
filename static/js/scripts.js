document.addEventListener('DOMContentLoaded', function () {
    const queryForm = document.getElementById('query-form');
    const loadingMessage = document.getElementById('loading-message');
    const chatbotResponse = document.getElementById('chatbot-response');
    const faqSelect = document.getElementById('faq-dropdown');
    const queryInput = document.getElementById('query');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const pdfLoadingMessage = document.getElementById('pdf-loading-message');
    const linkInput = document.getElementById('webpage');
    const linkSubmitButton = document.getElementById('link-submit');
    const followUpFAQContainer = document.getElementById('follow-up-faqs'); // Container for follow-up FAQs
    const backToUploadBtn = document.getElementById('back-to-upload-btn');
    // Debug statement for DOMContentLoaded
    console.log("DOMContentLoaded event fired");

    if (linkSubmitButton) {
        linkSubmitButton.addEventListener('click', async function () {
            const webpageUrl = linkInput.value.trim();
            if (webpageUrl) {
                pdfLoadingMessage.style.display = 'block';
                await clearChatHistory();
                await generateFAQsForLink(webpageUrl);
                pdfLoadingMessage.style.display = 'none';
            } else {
                console.log("Please enter a valid webpage URL");
            }
        });
    } else {
        console.log("Link submit button not found");
    }

    // Check if on upload_pdf.html page
    const pdfInput = document.getElementById('pdf');
    if (pdfInput) {
        pdfInput.addEventListener('change', async function (event) {
            const pdfFile = event.target.files[0];
            pdfLoadingMessage.style.display = 'block';
            await clearChatHistory();
            await generateFAQs(pdfFile);
            pdfLoadingMessage.style.display = 'none';
        });
    } else {
        console.log("PDF input element not found");
    }

    // Event listener for form submission (asking question)
    queryForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        loadingMessage.style.display = 'block';

        const formData = new FormData(queryForm);
        const query = formData.get('query');

        try {
            const response = await askQuestion(query);
            console.log("from event list for form selection");
            displayResponse(response);
            await generateFollowUpFAQs(response);
            loadingMessage.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            displayError(error);
            loadingMessage.style.display = 'none';
        }
    });

    faqSelect.addEventListener('change', async function () {
        const selectedQuestion = faqSelect.selectedIndex;
        console.log("index= ", selectedQuestion);
        if (selectedQuestion) {
            const faqs = await fetchFAQs();
            const answer = faqs[selectedQuestion - 1]['answer'].replace(/\*\*/g, '').replace(/^A:\s*/, '').replace(/^- /, '').replace(/^Answer:\s*/, '');
            const question = faqs[selectedQuestion - 1]['question'].replace(/\*\*/g, '').replace(/^Q:\s*/, '');
    
            if (answer) {
                try {
                    console.log("from event list for FAQ selection");
                    displayResponseFAQ(answer, question);
                    await generateFollowUpFAQs(answer);  // Generate follow-up FAQs for FAQ answers
                    faqSelect.selectedIndex = 0; // Reset to default option after displaying the response
                } catch (error) {
                    displayError(error);
                }
            }
        }
    });

    // Event listener for Clear History button
    clearHistoryBtn.addEventListener('click', clearChatHistory);

    // Function to fetch FAQs from faqs.json file
    async function fetchFAQs() {
        try {
            const response = await fetch('/static/faqs.json');
            if (!response.ok) {
                throw new Error('Failed to load FAQs');
            }
            const faqs = await response.json();
            console.log('fetched faqs: ', faqs);
            return faqs;
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            return [];
        }
    }

    // Function to populate the FAQ dropdown
    async function populateFAQsDropdown() {
        console.log("populateFAQsDropdown called");
        const faqs = await fetchFAQs();
        const faqDropdown = document.getElementById('faq-dropdown');

        faqs.forEach(faq => {
            const option = document.createElement('option');
            option.textContent = faq.question.replace(/\*\*/g, '').replace(/^Q:\s*/, '');
            faqDropdown.appendChild(option);
        });

        console.log("FAQs populated:", faqs);
    }

    async function askQuestion(query) {
        const formData = new FormData();
        formData.append('query', query);

        const response = await fetch('/ask', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to get response from server');
        }

        const responseData = await response.json();
        return responseData.response;
    }

    async function generateFAQs(pdf) {
        console.log("generateFAQs called with PDF:", pdf);
        const formData = new FormData();
        formData.append('pdf', pdf);

        try {
            const response = await fetch('/generate_faqs', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to generate FAQs');
            }

            const responseData = await response.json();
            console.log("Generated FAQs:", responseData);

            // Redirect to index.html after generating FAQs
            window.location.replace('/index.html');
        } catch (error) {
            console.error('Error generating FAQs:', error);
            throw error;
        }
    }

// Function to call the generate_faqsforlink endpoint
async function generateFAQsForLink(webpageUrl) {
    try {
        const formData = new FormData();
        formData.append('webpage', webpageUrl);

        const response = await fetch('/generate_faqsforlink', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('FAQs:', data.response);
            window.location.replace('/index.html');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

backToUploadBtn.addEventListener('click', function () {
    clearChatHistory();
    window.location.replace('/');
});

    async function generateFollowUpFAQs(response) {
        try {
            const followUpResponse = await fetch('/generate_follow_up_questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: response }),
            });

            const data = await followUpResponse.json();
            if (data.follow_up_questions) {
                displayFollowUpFAQs(data.follow_up_questions);
                addFollowUpFAQClickListeners();
            } else {
                console.error('Error:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }




/*

    // Function to display follow-up FAQs and add click listeners
    function displayFollowUpFAQs(questions) {
        const conversationHistory = document.getElementById('conversation-history');
        const followUpContainer = document.createElement('div');
        followUpContainer.classList.add('follow-up-questions');
        followUpContainer.innerHTML = `<strong>Follow-up Questions:</strong>`;

        const questionList = document.createElement('ul');
        questionList.classList.add('no-bullet'); // Add this line to apply the CSS class

        questions.forEach(question => {
            const listItem = document.createElement('li');
            listItem.textContent = question;
            listItem.style.textAlign = 'right'; // Right align each question
            listItem.classList.add('follow-up-faq-item'); // Add a class for follow-up FAQ items
            questionList.appendChild(listItem);
        });

        followUpContainer.appendChild(questionList);
        conversationHistory.appendChild(followUpContainer);
    }

*/

    function displayFollowUpFAQs(questions) {
        followUpFAQContainer.innerHTML = `<strong>Follow-up Questions:</strong>`;

        const questionList = document.createElement('ul');
        questionList.classList.add('no-bullet');
    
        questions.forEach(question => {
            const listItem = document.createElement('li');
            listItem.textContent = question;
            listItem.classList.add('follow-up-faq-item');
            questionList.appendChild(listItem);
        });
    
        followUpFAQContainer.appendChild(questionList);

    }


    function addFollowUpFAQClickListeners() {
        const followUpFAQItems = followUpFAQContainer.querySelectorAll('.follow-up-faq-item');
        followUpFAQItems.forEach(item => {
            console.log(item);
            item.addEventListener('click', function () {
                queryInput.value = item.textContent; // Set the question in the input field
                queryForm.dispatchEvent(new Event('submit')); // Trigger the form submission
            });
        });
    }
    function displayFAQs(faqs) {
        chatbotResponse.innerHTML = faqs;
    }

    function displayResponse(response) {
        console.log("displayed");
        //chatbotResponse.innerHTML = response; // Changed to innerHTML to render HTML tags correctly
        updateConversationHistory();
    }

    function displayResponseFAQ(answer, question) {
        //chatbotResponse.innerHTML = answer; // Changed to innerHTML to render HTML tags correctly
    
        // Update the conversation history with FAQ question and answer
        updateConversationHistoryWithFAQ(question, answer);
    }

    // Function to update the conversation history with FAQ data
    async function updateConversationHistoryWithFAQ(question, answer) {
        try {
            const response = await fetch('/conversation_history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'user',
                    content: question,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update conversation history with question');
            }
            const response2 = await fetch('/conversation_history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'assistant',
                    content: answer,
                }),
            });
            if (!response2.ok) {
                throw new Error('Failed to update conversation history with answer');
            }

            const updatedHistory = await fetch('/conversation_history');
            if (!updatedHistory.ok) {
                throw new Error('Failed to get updated conversation history');
            }
            const history = await updatedHistory.json();
            renderConversationHistory(history);
        } catch (error) {
            console.error('Error updating conversation history with FAQ:', error);
        }
    }

    async function updateConversationHistory() {
        try {
            console.log("update convo hist");
            const response = await fetch('/conversation_history');
            if (!response.ok) {
                throw new Error('Failed to get conversation history');
            }
            const history = await response.json();
            renderConversationHistory(history);
        } catch (error) {
            console.error('Error fetching conversation history:', error);
        }
    }

    function renderConversationHistory(history) {
        const historyContainer = document.getElementById('conversation-history');
        if (!historyContainer) {
            console.error('No conversation history container found');
            return;
        }
    
        historyContainer.innerHTML = ''; // Clear previous history
    
        if (!Array.isArray(history)) {
            console.error('Conversation history is not an array');
            return;
        }
    
        history.forEach(item => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', item.role === 'user' ? 'user-message' : 'assistant-message');
    
            // Add a label to indicate the sender
            const labelElement = document.createElement('div');
            labelElement.classList.add('label');
            labelElement.textContent = item.role === 'user' ? 'User' : 'Chatbot';
    
            // Create a div for the content of the message
            const textElement = document.createElement('div');
            textElement.innerHTML = item.content; // Changed to innerHTML to render HTML tags correctly
    
            messageElement.appendChild(labelElement); // Add the label to the message element
            messageElement.appendChild(textElement);  // Add the text content to the message element
    
            historyContainer.appendChild(messageElement); // Append the message to the history container
        });
    }

    async function clearChatHistory() {
        try {
            // Clear the conversation history on the server side
            const response = await fetch('/clear_conversation_history', {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('Failed to clear conversation history');
            }

            // Clear the conversation history on the client side
            const historyContainer = document.getElementById('conversation-history');
            if (historyContainer) {
                historyContainer.innerHTML = ''; // Clear the conversation history
            }

            // Clear the follow-up FAQs on the client side
            if (followUpFAQContainer) {
                followUpFAQContainer.innerHTML = ''; // Clear the follow-up FAQs
            }
        } catch (error) {
            console.error('Error clearing conversation history:', error);
        }
    }

    // Populate FAQs on page load
    populateFAQsDropdown();
    updateConversationHistory();
});
