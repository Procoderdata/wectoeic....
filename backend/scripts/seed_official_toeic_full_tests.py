#!/usr/bin/env python3
from __future__ import annotations

import html
import json
import shutil
import subprocess
import tempfile
import textwrap
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
PUBLIC_ROOT = FRONTEND_DIR / "public" / "toeic-official"
DATA_FILE = BACKEND_DIR / "data" / "toeic_admin_state.json"
SAY_BIN = shutil.which("say")
AFCONVERT_BIN = shutil.which("afconvert")


TEST_PROFILES = [
    {
        "id": "ets-2026-test-1",
        "series": "ETS 2026",
        "title": "Test 1",
        "status": "Chua lam",
        "focus": "Classic ETS pacing",
        "form": "Form A",
        "locale": "Global",
        "month": "April",
        "year": "2026",
        "company": "North Harbor Logistics",
        "company_short": "North Harbor",
        "city": "Singapore",
        "branch": "Riverside",
        "manager": "Ms. Patel",
        "assistant": "Daniel Cho",
        "vendor": "Blue Peak Supplies",
        "event": "Harbor Career Expo",
        "venue": "Harborview Convention Center",
        "airport": "Rivergate Airport",
        "restaurant": "Sunset Bistro",
        "warehouse": "Dock 8 warehouse",
        "street": "Maple Street",
        "app_name": "RouteBoard",
        "product": "Aster speaker",
        "service": "priority delivery",
        "campaign": "summer member drive",
        "team": "client support team",
        "department": "operations department",
        "magazine": "Urban Trade Review",
        "neighborhood": "West Harbor",
        "director": "Olivia Reed",
    },
    {
        "id": "ets-2026-test-2",
        "series": "ETS 2026",
        "title": "Test 2",
        "status": "Da lam",
        "focus": "Mixed grammar traps",
        "form": "Form B",
        "locale": "Global",
        "month": "April",
        "year": "2026",
        "company": "Summit Lane Retail",
        "company_short": "Summit Lane",
        "city": "Toronto",
        "branch": "Midtown",
        "manager": "Mr. Gomez",
        "assistant": "Rina Park",
        "vendor": "Clear Sky Office Goods",
        "event": "City Business Showcase",
        "venue": "North Hall Exhibition Center",
        "airport": "Lakeside International Airport",
        "restaurant": "Maple House Cafe",
        "warehouse": "North Dock storage center",
        "street": "Grand Avenue",
        "app_name": "TaskSpring",
        "product": "Mira tablet stand",
        "service": "same-day courier",
        "campaign": "autumn rewards launch",
        "team": "brand communications team",
        "department": "finance department",
        "magazine": "Retail Leader Monthly",
        "neighborhood": "Old Town",
        "director": "Marcus Bell",
    },
]


PHOTO_SCENES = [
    {
        "asset": "pouring",
        "kind": "pouring",
        "caption": "A staff member is pouring a drink into a bottle.",
        "options": [
            "A woman is pouring liquid into a container.",
            "A customer is hanging a sign on the wall.",
            "A clerk is opening a refrigerator door.",
            "Some papers are being stacked on a counter.",
        ],
        "answer": "A",
    },
    {
        "asset": "warehouse",
        "kind": "warehouse",
        "caption": "Workers are arranging boxes on shelving units.",
        "options": [
            "A man is locking the front entrance.",
            "Several boxes are being placed on shelves.",
            "A truck is being washed outside a garage.",
            "Two people are reading a menu board.",
        ],
        "answer": "B",
    },
    {
        "asset": "board",
        "kind": "board",
        "caption": "Travelers are standing under a departure board.",
        "options": [
            "Passengers are waiting near an information display.",
            "A mechanic is repairing an engine.",
            "Employees are serving meals at a counter.",
            "A customer is paying for a jacket.",
        ],
        "answer": "A",
    },
    {
        "asset": "panel",
        "kind": "panel",
        "caption": "A technician is checking a control panel.",
        "options": [
            "A worker is sweeping the factory floor.",
            "The machine is being moved onto a truck.",
            "Someone is inspecting an electronic panel.",
            "A crowd is gathering outside a theater.",
        ],
        "answer": "C",
    },
    {
        "asset": "kitchen",
        "kind": "kitchen",
        "caption": "A cook is placing trays into an oven.",
        "options": [
            "Food is being arranged on display shelves.",
            "A chef is loading trays into an oven.",
            "Dishes are being cleared from a table.",
            "A waiter is carrying menus to guests.",
        ],
        "answer": "B",
    },
    {
        "asset": "bike",
        "kind": "bike",
        "caption": "A commuter is locking a bicycle near an office.",
        "options": [
            "A cyclist is securing a bicycle to a rack.",
            "A package is being delivered to a front desk.",
            "Garden tools are being stored in a shed.",
            "People are crossing a busy intersection.",
        ],
        "answer": "A",
    },
]


PART2_ITEMS = [
    {
        "prompt": "Where should I place these invoices for {company_short}?",
        "choices": ["On {assistant}'s desk.", "For about twenty minutes.", "Because the printer is new."],
        "answer": "A",
    },
    {
        "prompt": "Didn't {manager} approve the travel request yesterday?",
        "choices": ["Yes, she signed it before lunch.", "At the airport gate.", "A blue folder."],
        "answer": "A",
    },
    {
        "prompt": "When will the shuttle leave for {venue}?",
        "choices": ["At 8:30 this morning.", "By the side entrance.", "With two guests."],
        "answer": "A",
    },
    {
        "prompt": "Who is updating the {app_name} training guide?",
        "choices": ["The IT coordinator is.", "Near the reception desk.", "Because it was delayed."],
        "answer": "A",
    },
    {
        "prompt": "Could you send me the revised budget by noon?",
        "choices": ["Certainly, I have almost finished it.", "No, the meeting room is upstairs.", "I ordered soup instead."],
        "answer": "A",
    },
    {
        "prompt": "Why was the front lobby closed this morning?",
        "choices": ["It was being repainted.", "At the main branch.", "Quite a few visitors."],
        "answer": "A",
    },
    {
        "prompt": "How often does the warehouse team inspect the loading dock?",
        "choices": ["Twice a week.", "By barcode scanner.", "At dock number nine."],
        "answer": "A",
    },
    {
        "prompt": "Would you rather meet on Thursday or Friday?",
        "choices": ["Friday works better for me.", "No, I have not read it.", "It is beside the elevator."],
        "answer": "A",
    },
    {
        "prompt": "Can I reserve a table at {restaurant} for six people?",
        "choices": ["Of course, for what time?", "The soup was delicious.", "Near the parking lot."],
        "answer": "A",
    },
    {
        "prompt": "What time does the bookstore in {neighborhood} open?",
        "choices": ["At nine o'clock.", "For the history section.", "With my business card."],
        "answer": "A",
    },
    {
        "prompt": "Haven't the samples from {vendor} arrived yet?",
        "choices": ["No, they are scheduled for tomorrow.", "In a locked cabinet.", "To the design studio."],
        "answer": "A",
    },
    {
        "prompt": "Which report should I print for the board meeting?",
        "choices": ["The monthly sales summary.", "On recycled paper.", "Beside the projector."],
        "answer": "A",
    },
    {
        "prompt": "Who's going to welcome the guests from {city}?",
        "choices": ["The reception manager will.", "A twenty-minute drive.", "At the side entrance."],
        "answer": "A",
    },
    {
        "prompt": "Didn't you say the seminar was free?",
        "choices": ["Yes, registration is free.", "The seminar room is large.", "By the train station."],
        "answer": "A",
    },
    {
        "prompt": "Why don't we order extra chairs before the event starts?",
        "choices": ["That's a good idea.", "About three feet wide.", "Because the lights were bright."],
        "answer": "A",
    },
    {
        "prompt": "How many volunteers signed up for the {event}?",
        "choices": ["A little over forty.", "By using the back entrance.", "Yes, in the lobby."],
        "answer": "A",
    },
    {
        "prompt": "Could you remind me to call the repair company?",
        "choices": ["Sure, I'll send you a message.", "The phone is on the counter.", "At half past three."],
        "answer": "A",
    },
    {
        "prompt": "Where can I find the visitor badges?",
        "choices": ["In the drawer beside the copier.", "For the annual conference.", "About twelve dollars."],
        "answer": "A",
    },
    {
        "prompt": "When is the article for {magazine} due?",
        "choices": ["By next Monday afternoon.", "It's about local startups.", "On the third floor."],
        "answer": "A",
    },
    {
        "prompt": "Who approved the final layout for the brochure?",
        "choices": ["{director} did.", "A stack of blue folders.", "During the lunch break."],
        "answer": "A",
    },
    {
        "prompt": "Would it be possible to postpone the orientation?",
        "choices": ["Yes, we can move it to next week.", "In the employee lounge.", "A welcome packet."],
        "answer": "A",
    },
    {
        "prompt": "Why is the break room so crowded today?",
        "choices": ["A food-tasting event is taking place.", "The lights were replaced.", "At the side counter."],
        "answer": "A",
    },
    {
        "prompt": "How should I label the cartons for {warehouse}?",
        "choices": ["Use the red destination stickers.", "On a metal shelf.", "By the freight elevator."],
        "answer": "A",
    },
    {
        "prompt": "Didn't the customer ask for a digital receipt?",
        "choices": ["That's right, I'll email it now.", "A shorter line today.", "The payment terminal."],
        "answer": "A",
    },
    {
        "prompt": "Which entrance should our guests use tomorrow?",
        "choices": ["The one facing {street}.", "At ten o'clock sharp.", "Because the sign was removed."],
        "answer": "A",
    },
]


PART3_GROUPS = [
    {
        "title": "Meeting room update",
        "transcript": """
        Woman: Hi, {manager}. The training room on the third floor is being repainted.
        Man: Then let's move tomorrow's orientation to Conference Room B on the first floor.
        Woman: No problem. I'll change the sign in the lobby and email the new room number to the interns.
        """,
        "questions": [
            {
                "prompt": "What are the speakers mainly discussing?",
                "choices": ["A delayed shipment", "A room change", "A hiring plan", "A software purchase"],
                "answer": "B",
            },
            {
                "prompt": "Where will the orientation be held?",
                "choices": ["On the third floor", "In Conference Room B", "At the warehouse", "At a nearby hotel"],
                "answer": "B",
            },
            {
                "prompt": "What will the woman do next?",
                "choices": ["Contact the painter", "Print name badges", "Send an email", "Reserve lunch trays"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Delivery timetable",
        "graphic": {
            "kind": "table",
            "asset": "delivery-timetable",
            "title": "{service} schedule",
            "headers": ["Route", "Departure", "Status"],
            "rows": [
                ["Downtown", "9:00 A.M.", "On time"],
                ["Airport", "11:30 A.M.", "Delayed"],
                ["Harbor", "2:15 P.M.", "On time"],
            ],
            "note": "Live dispatch board",
        },
        "transcript": """
        Man: The airport run is delayed again because one of the vans needs maintenance.
        Woman: Should we move those boxes to the two-fifteen harbor route instead?
        Man: Yes. Please update the board and call the driver so he knows to collect them at dock three.
        """,
        "questions": [
            {
                "prompt": "What problem do the speakers mention?",
                "choices": ["A route has been delayed", "A customer canceled an order", "A payment was missing", "A sign was printed incorrectly"],
                "answer": "A",
            },
            {
                "prompt": "According to the graphic, which route is delayed?",
                "choices": ["Downtown", "Airport", "Harbor", "None of them"],
                "answer": "B",
            },
            {
                "prompt": "What does the man ask the woman to do?",
                "choices": ["Move boxes to another route", "Hire a new driver", "Prepare sales materials", "Meet a client in person"],
                "answer": "A",
            },
        ],
    },
    {
        "title": "Gate change at the airport",
        "transcript": """
        Woman: Excuse me, is this the line for Flight 482 to Osaka?
        Man: It was, but the flight was moved to Gate 12 after the delay.
        Woman: Thanks. I'll send a quick message to my colleague before I head over there.
        """,
        "questions": [
            {
                "prompt": "Where most likely are the speakers?",
                "choices": ["At a restaurant", "At an airport", "At a bookstore", "At a repair shop"],
                "answer": "B",
            },
            {
                "prompt": "What does the man say about the flight?",
                "choices": ["It will depart early", "It has been canceled", "Its gate has changed", "Its tickets are sold out"],
                "answer": "C",
            },
            {
                "prompt": "What will the woman do next?",
                "choices": ["Check a suitcase", "Call a colleague", "Buy a ticket", "Speak to a pilot"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Cafe promotion review",
        "graphic": {
            "kind": "table",
            "asset": "promotion-results",
            "title": "Weekly coupon use",
            "headers": ["Day", "Lunch", "Dinner"],
            "rows": [
                ["Mon", "38", "14"],
                ["Tue", "42", "16"],
                ["Wed", "51", "19"],
            ],
            "note": "Coupon redemptions",
        },
        "transcript": """
        Man: The buy-one-get-one lunch coupon brought in more customers than the dinner offer.
        Woman: I can see that from the numbers. Wednesday was especially strong.
        Man: Let's keep the lunch promotion for one more week and redesign the dinner poster.
        """,
        "questions": [
            {
                "prompt": "What are the speakers analyzing?",
                "choices": ["A repair estimate", "A coupon campaign", "A new menu item", "A catering request"],
                "answer": "B",
            },
            {
                "prompt": "According to the graphic, when were the most lunch coupons used?",
                "choices": ["Monday", "Tuesday", "Wednesday", "No information is given"],
                "answer": "C",
            },
            {
                "prompt": "What does the man suggest?",
                "choices": ["Lowering prices", "Hiring more workers", "Publishing a recipe", "Continuing the lunch promotion"],
                "answer": "D",
            },
        ],
    },
    {
        "title": "Apartment maintenance",
        "transcript": """
        Woman: The heater in apartment 4B is making a loud clicking sound.
        Man: I can stop by after lunch to take a look at it.
        Woman: Great. I'll let the tenant know that you'll need access around one-thirty.
        """,
        "questions": [
            {
                "prompt": "What problem does the woman mention?",
                "choices": ["A broken elevator", "A noisy heater", "A missing package", "A water leak"],
                "answer": "B",
            },
            {
                "prompt": "When will the man visit apartment 4B?",
                "choices": ["Before lunch", "After lunch", "This evening", "Next week"],
                "answer": "B",
            },
            {
                "prompt": "What will the woman do?",
                "choices": ["Buy a replacement part", "Call the building owner", "Inform the tenant", "Deliver a refund"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Workshop registration",
        "transcript": """
        Man: I noticed your name is missing from the spreadsheet for Friday's design workshop.
        Woman: That's because I was waiting to confirm whether my train arrives on time.
        Man: Registration closes tonight, so I'll reserve a seat for you now and you can update your travel details later.
        """,
        "questions": [
            {
                "prompt": "Why is the woman's name missing from the spreadsheet?",
                "choices": ["She changed departments", "She has not confirmed her travel", "She forgot her password", "She already attended the workshop"],
                "answer": "B",
            },
            {
                "prompt": "What does the man say about registration?",
                "choices": ["It closes tonight", "It moved to next week", "It must be done in person", "It requires a fee"],
                "answer": "A",
            },
            {
                "prompt": "What will the man do?",
                "choices": ["Book a hotel room", "Reserve a seat", "Send a train ticket", "Print the workshop agenda"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Supply cabinet inventory",
        "graphic": {
            "kind": "table",
            "asset": "supply-cabinet",
            "title": "Current inventory",
            "headers": ["Item", "In stock", "Reorder level"],
            "rows": [
                ["Labels", "90", "50"],
                ["Toner", "2", "4"],
                ["Envelopes", "140", "75"],
            ],
            "note": "Office supply tracker",
        },
        "transcript": """
        Woman: We're almost out of toner again.
        Man: You're right. The spreadsheet says we should reorder whenever the number drops below four.
        Woman: I'll add toner to today's purchase request and leave the other items alone for now.
        """,
        "questions": [
            {
                "prompt": "What are the speakers discussing?",
                "choices": ["An office inventory report", "A travel itinerary", "An employee schedule", "A customer complaint"],
                "answer": "A",
            },
            {
                "prompt": "According to the graphic, which item is below the reorder level?",
                "choices": ["Labels", "Toner", "Envelopes", "None of them"],
                "answer": "B",
            },
            {
                "prompt": "What will the woman do?",
                "choices": ["Repair the printer", "Submit a purchase request", "Move supplies to another office", "Count all stored folders"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Library program planning",
        "transcript": """
        Man: The author visit is getting more registrations than our usual book club night.
        Woman: Then we should move it from the reading room to the auditorium.
        Man: Good idea. I'll also ask the volunteers to set up extra chairs before people arrive.
        """,
        "questions": [
            {
                "prompt": "What event are the speakers discussing?",
                "choices": ["A cooking class", "An author visit", "A budget meeting", "A repair workshop"],
                "answer": "B",
            },
            {
                "prompt": "Why do the speakers want to change rooms?",
                "choices": ["The reading room is closed", "More people registered than expected", "The author requested a projector", "The auditorium is cheaper"],
                "answer": "B",
            },
            {
                "prompt": "What will the man ask volunteers to do?",
                "choices": ["Prepare refreshments", "Welcome visitors", "Set up chairs", "Clean the stage"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Hotel reservation correction",
        "transcript": """
        Woman: I booked the client for two nights, but her train won't arrive until late on Wednesday.
        Man: In that case, shorten the reservation by one night and keep the breakfast package.
        Woman: All right. I'll update the booking before I send the confirmation email.
        """,
        "questions": [
            {
                "prompt": "What mistake did the woman make?",
                "choices": ["She selected the wrong meal plan", "She booked too many nights", "She used the wrong hotel", "She forgot to include parking"],
                "answer": "B",
            },
            {
                "prompt": "What does the man tell the woman to keep?",
                "choices": ["The airport pickup", "The breakfast package", "The meeting room", "The second guest pass"],
                "answer": "B",
            },
            {
                "prompt": "What will the woman do next?",
                "choices": ["Speak with the client", "Change the reservation", "Call the train station", "Prepare a refund"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Brochure approval",
        "transcript": """
        Man: I like the updated layout, especially the photo on the front cover.
        Woman: Thanks. I still need your signature before the printer can begin.
        Man: I'll sign it now, and then please send the final file to the print shop before five o'clock.
        """,
        "questions": [
            {
                "prompt": "What item are the speakers discussing?",
                "choices": ["A brochure", "A contract", "A travel map", "A product sample"],
                "answer": "A",
            },
            {
                "prompt": "What does the woman need from the man?",
                "choices": ["A new photo", "A signature", "A budget report", "A shipping label"],
                "answer": "B",
            },
            {
                "prompt": "What does the man ask the woman to do?",
                "choices": ["Meet the client", "Call the design team", "Send the file to the printer", "Buy paper supplies"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Bus route adjustment",
        "graphic": {
            "kind": "table",
            "asset": "shuttle-routes",
            "title": "Company shuttle",
            "headers": ["Stop", "Morning", "Evening"],
            "rows": [
                ["Central Station", "7:20", "5:20"],
                ["Market Square", "7:35", "5:35"],
                ["Hill Park", "7:50", "5:50"],
            ],
            "note": "Regular weekday schedule",
        },
        "transcript": """
        Woman: The evening shuttle is too early for employees who finish at five-thirty.
        Man: Then let's move the first evening pickup to five-fifty instead of five-twenty.
        Woman: Good. I'll post the revised schedule near the cafeteria and in the staff app.
        """,
        "questions": [
            {
                "prompt": "What service are the speakers talking about?",
                "choices": ["An office cafeteria", "A company shuttle", "A software update", "A customer hotline"],
                "answer": "B",
            },
            {
                "prompt": "According to the graphic, what time does the evening shuttle currently leave Central Station?",
                "choices": ["5:20", "5:35", "5:50", "7:20"],
                "answer": "A",
            },
            {
                "prompt": "What will the woman do next?",
                "choices": ["Interview employees", "Contact a driver", "Post the new schedule", "Order more buses"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Software rollout",
        "transcript": """
        Man: The sales team finished testing the new dashboard in {app_name}.
        Woman: Great. Did they mention any issues?
        Man: Only one. They want the export button moved closer to the report filters, so I've asked the developer to make that change before tomorrow morning.
        """,
        "questions": [
            {
                "prompt": "What project are the speakers discussing?",
                "choices": ["A building renovation", "A dashboard update", "A training video", "A website advertisement"],
                "answer": "B",
            },
            {
                "prompt": "What change was requested?",
                "choices": ["A new login system", "A larger report filter", "A relocated export button", "A different background color"],
                "answer": "C",
            },
            {
                "prompt": "What has the man already done?",
                "choices": ["Asked a developer to make a change", "Scheduled a sales meeting", "Prepared a user manual", "Sent the app to customers"],
                "answer": "A",
            },
        ],
    },
    {
        "title": "Museum tour booking",
        "transcript": """
        Woman: We would like to book a guided tour for thirty students next Friday.
        Man: That should be fine, but the ten o'clock slot is full.
        Woman: In that case, please reserve the noon tour and send the payment instructions to my email.
        """,
        "questions": [
            {
                "prompt": "Why is the woman calling?",
                "choices": ["To request a guided tour", "To report a missing bag", "To cancel a magazine subscription", "To order lunch for a group"],
                "answer": "A",
            },
            {
                "prompt": "What does the man say about the ten o'clock slot?",
                "choices": ["It is discounted", "It is full", "It is only for adults", "It was moved outdoors"],
                "answer": "B",
            },
            {
                "prompt": "What does the woman ask the man to do?",
                "choices": ["Send payment instructions", "Call the students", "Reserve a bus", "Prepare name tags"],
                "answer": "A",
            },
        ],
    },
]


PART4_GROUPS = [
    {
        "title": "Store announcement",
        "transcript": """
        Good morning, shoppers. The escalator beside the home-goods section is temporarily out of service while technicians complete a safety inspection.
        If you need to reach the second floor, please use the elevator near the customer service desk instead.
        We expect the escalator to reopen before noon. Thank you for your patience.
        """,
        "questions": [
            {
                "prompt": "Where would this announcement most likely be heard?",
                "choices": ["In a department store", "At an airport", "In a classroom", "At a post office"],
                "answer": "A",
            },
            {
                "prompt": "Why is the escalator unavailable?",
                "choices": ["It is being cleaned", "It is being inspected", "A sale is taking place", "A shipment is arriving"],
                "answer": "B",
            },
            {
                "prompt": "What are customers asked to use instead?",
                "choices": ["A side entrance", "A shuttle bus", "An elevator", "A stairway outdoors"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Tour schedule",
        "graphic": {
            "kind": "table",
            "asset": "facility-tour",
            "title": "Visitor itinerary",
            "headers": ["Day", "Time", "Activity"],
            "rows": [
                ["Tuesday", "Noon", "Facility tour"],
                ["Wednesday", "8:00 A.M.", "Meeting with Chicago staff"],
                ["Thursday", "2:00 P.M.", "Shareholder presentation"],
                ["Friday", "4:45 P.M.", "Return flight"],
            ],
            "note": "Executive visit plan",
        },
        "transcript": """
        Hello, Ms. Turner. I have finalized your travel itinerary for this week's visit to our Midwest office.
        As shown in the schedule, we moved the shareholder presentation to Thursday afternoon so you can meet the Chicago staff first.
        If you want to add time for an investor lunch, Tuesday would be the best day.
        """,
        "questions": [
            {
                "prompt": "What is the speaker mainly talking about?",
                "choices": ["A job offer", "A travel schedule", "A product recall", "A software manual"],
                "answer": "B",
            },
            {
                "prompt": "According to the graphic, when will the shareholder presentation take place?",
                "choices": ["Tuesday at noon", "Wednesday at 8:00 A.M.", "Thursday at 2:00 P.M.", "Friday at 4:45 P.M."],
                "answer": "C",
            },
            {
                "prompt": "What does the speaker suggest adding on Tuesday?",
                "choices": ["A site inspection", "An investor lunch", "A flight change", "A press conference"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Voice mail from a repair company",
        "transcript": """
        Hello, this is Martin from Swift Repair Services.
        I'm calling to confirm that our technician will arrive at your office between ten and eleven tomorrow morning to service the copy machine on the second floor.
        Please make sure the area around the machine is clear so we can begin work right away.
        """,
        "questions": [
            {
                "prompt": "Who most likely is the speaker?",
                "choices": ["A repair technician", "A flight attendant", "A newspaper editor", "A restaurant server"],
                "answer": "A",
            },
            {
                "prompt": "What will happen tomorrow morning?",
                "choices": ["A training session", "A machine repair", "A staff interview", "A product delivery"],
                "answer": "B",
            },
            {
                "prompt": "What does the speaker ask the listener to do?",
                "choices": ["Unlock the front door", "Prepare a payment receipt", "Clear the area near the machine", "Move boxes to the lobby"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Team meeting intro",
        "transcript": """
        Thanks for joining this week's team meeting.
        Before we review the new client accounts, I want to congratulate everyone for reaching our quarterly response-time goal.
        After the meeting, please stop by the break room to pick up your updated ID badges from the front table.
        """,
        "questions": [
            {
                "prompt": "What is the purpose of the talk?",
                "choices": ["To welcome new clients", "To begin a team meeting", "To announce a building closure", "To explain a software error"],
                "answer": "B",
            },
            {
                "prompt": "What achievement does the speaker mention?",
                "choices": ["A quarterly response-time goal", "A product launch date", "A new office opening", "A travel budget increase"],
                "answer": "A",
            },
            {
                "prompt": "What are listeners asked to pick up?",
                "choices": ["Laptop chargers", "Printed invoices", "Updated ID badges", "Visitor schedules"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Flight notice",
        "graphic": {
            "kind": "table",
            "asset": "flight-board",
            "title": "Departures",
            "headers": ["Flight", "Destination", "Status"],
            "rows": [
                ["431", "Osaka", "Delayed"],
                ["518", "Seoul", "Boarding"],
                ["602", "Sydney", "On time"],
            ],
            "note": "Gate C monitor",
        },
        "transcript": """
        Attention, passengers. Flight 431 to Osaka has been delayed due to severe weather in the destination area.
        At this time, we expect boarding to begin forty minutes later than planned.
        Passengers may collect a meal voucher at the customer service counter near Gate C.
        """,
        "questions": [
            {
                "prompt": "What is causing the delay?",
                "choices": ["A staffing shortage", "Weather conditions", "A missing passenger", "A security drill"],
                "answer": "B",
            },
            {
                "prompt": "According to the graphic, which flight is currently boarding?",
                "choices": ["431", "518", "602", "No flight is boarding"],
                "answer": "B",
            },
            {
                "prompt": "What can delayed passengers receive?",
                "choices": ["A hotel room", "A baggage refund", "A meal voucher", "A free seat upgrade"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Office tour greeting",
        "transcript": """
        Welcome to {company}. My name is Jenna, and I will be showing you around our headquarters this afternoon.
        We'll begin in the design studio on the fourth floor, and then we'll visit the customer support area.
        Please keep your visitor badge visible at all times while you are in the building.
        """,
        "questions": [
            {
                "prompt": "Who are the listeners?",
                "choices": ["Store employees", "Visitors", "Delivery drivers", "New customers"],
                "answer": "B",
            },
            {
                "prompt": "Where will the tour begin?",
                "choices": ["In the lobby", "On the fourth floor", "At the support desk", "In the cafeteria"],
                "answer": "B",
            },
            {
                "prompt": "What are listeners asked to do?",
                "choices": ["Sign a contract", "Wear a visitor badge", "Turn off their phones", "Return at noon"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Radio advertisement",
        "transcript": """
        This weekend only, stop by {restaurant} for our neighborhood brunch festival.
        Local musicians will perform on the patio from ten until two, and every table will receive a complimentary dessert sampler.
        Reservations are recommended, so visit our website today to choose your seating time.
        """,
        "questions": [
            {
                "prompt": "What is being advertised?",
                "choices": ["A bookstore opening", "A brunch event", "A museum exhibit", "A cooking class series"],
                "answer": "B",
            },
            {
                "prompt": "What will customers receive?",
                "choices": ["A free dessert sampler", "A parking discount", "A printed recipe book", "A gift card"],
                "answer": "A",
            },
            {
                "prompt": "What are listeners encouraged to do?",
                "choices": ["Call a musician", "Reserve a table online", "Arrive before sunrise", "Order takeout"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Seminar schedule",
        "graphic": {
            "kind": "table",
            "asset": "seminar-schedule",
            "title": "Training day",
            "headers": ["Session", "Room", "Time"],
            "rows": [
                ["Leadership", "A12", "9:00"],
                ["Analytics", "B18", "11:00"],
                ["Client care", "A12", "2:00"],
            ],
            "note": "Conference center board",
        },
        "transcript": """
        Good afternoon, everyone. The analytics seminar will begin at eleven o'clock in Room B18 as listed on the schedule.
        If you registered for leadership instead, please note that it is still being held in Room A12.
        Printed workbooks are available on the table near the west entrance.
        """,
        "questions": [
            {
                "prompt": "What event are the listeners attending?",
                "choices": ["A sports camp", "A training day", "A product launch", "A city council meeting"],
                "answer": "B",
            },
            {
                "prompt": "According to the graphic, where will the analytics seminar be held?",
                "choices": ["A12", "B18", "West Hall", "2:00"],
                "answer": "B",
            },
            {
                "prompt": "What can listeners pick up near the west entrance?",
                "choices": ["Name tags", "Meal tickets", "Printed workbooks", "Parking passes"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Website maintenance notice",
        "transcript": """
        This is a message for all employees.
        The internal website will be unavailable from six until seven this evening while the IT team installs a security update.
        During that time, please save urgent requests in a document and upload them after service has been restored.
        """,
        "questions": [
            {
                "prompt": "What will happen this evening?",
                "choices": ["A product demonstration", "A website shutdown for maintenance", "A company dinner", "A new employee orientation"],
                "answer": "B",
            },
            {
                "prompt": "Why will the website be unavailable?",
                "choices": ["A file was deleted", "A security update is being installed", "New users are being trained", "A contest is being launched"],
                "answer": "B",
            },
            {
                "prompt": "What are employees asked to do?",
                "choices": ["Call the IT team", "Work from home", "Save urgent requests for later upload", "Change their passwords immediately"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Community lecture",
        "transcript": """
        Thank you for coming to tonight's lecture on urban garden design.
        The presentation will begin in five minutes, and afterward our guest speaker will answer questions from the audience.
        If you have not already done so, please silence your mobile phone before the program starts.
        """,
        "questions": [
            {
                "prompt": "What type of event is about to begin?",
                "choices": ["A lecture", "A cooking competition", "A staff interview", "A school performance"],
                "answer": "A",
            },
            {
                "prompt": "When will attendees be able to ask questions?",
                "choices": ["Before the lecture", "During the introduction", "After the presentation", "At the ticket desk"],
                "answer": "C",
            },
            {
                "prompt": "What are listeners asked to do?",
                "choices": ["Move to another hall", "Turn off their phones", "Collect study packets", "Sign an attendance sheet"],
                "answer": "B",
            },
        ],
    },
]


PART5_ITEMS = [
    ("All visitors are required to sign in at the front desk before ____ the warehouse.", ["enter", "entering", "entered", "to enter"], "B"),
    ("The finance team will review the proposal again ____ the revised figures arrive.", ["unless", "once", "although", "beside"], "B"),
    ("Please place the fragile items in the blue container so they can be handled ____.", ["care", "careful", "carefully", "more careful"], "C"),
    ("{manager} asked the assistants to prepare name badges for everyone ____ the workshop.", ["attend", "attends", "attending", "attended"], "C"),
    ("The printer in the lobby is unavailable today, so employees should use the machine on the ____ floor.", ["second", "two", "twice", "secondly"], "A"),
    ("Because the supplier lowered its prices, the store was able to offer a more ____ membership package.", ["afford", "affordable", "affordably", "afforded"], "B"),
    ("No later than Friday, each department must submit a list of items it plans to ____ next quarter.", ["purchase", "purchased", "purchasing", "purchases"], "A"),
    ("The marketing report was incomplete because one chart had been left ____ the final file.", ["off", "into", "along", "toward"], "A"),
    ("Employees who would like a parking permit should complete the online form and upload a copy of their vehicle ____.", ["register", "registered", "registration", "registering"], "C"),
    ("The museum's lecture series has become so popular that tickets often sell out several days in ____.", ["advance", "advancing", "advanced", "advances"], "A"),
    ("Customers may return unopened products within ten days, ____ they include the original receipt.", ["provided that", "except", "despite", "unless"], "A"),
    ("The new shelves are wider than the old ones, so the storage room can now hold ____ cartons.", ["many", "much", "more", "most"], "C"),
    ("To reduce wait times, the reception desk now uses a ticket system that assigns guests a queue number ____.", ["automatic", "automate", "automatically", "automation"], "C"),
    ("The article in {magazine} was written by an architect ____ specializes in small-office design.", ["who", "which", "whose", "whom"], "A"),
    ("Please be aware that all conference calls are recorded for training ____ quality-control purposes.", ["but", "and", "or", "so"], "B"),
    ("Our branch manager requested a summary of this month's returns, including the reasons customers gave for each ____.", ["one", "return", "employee", "counter"], "B"),
    ("The afternoon shuttle was delayed by road construction, ____ most passengers still arrived before the meeting began.", ["so", "yet", "because", "unless"], "B"),
    ("A detailed seating chart will be emailed to attendees once the registration deadline has ____.", ["passed", "passing", "passes", "pass"], "A"),
    ("The assistant discovered that one of the shipment labels had the street number printed ____.", ["incorrect", "incorrectly", "incorrectness", "to incorrect"], "B"),
    ("Since the office pantry is being cleaned, staff members are asked to keep all snacks at their desks until the work is ____.", ["complete", "completed", "completion", "completing"], "A"),
    ("The training video explains how the new scanner works and also gives tips on how to keep it in good ____.", ["condition", "conditional", "conditioning", "conditioned"], "A"),
    ("Candidates will be contacted individually if the interview panel needs ____ information before making a decision.", ["addition", "additional", "additionally", "add"], "B"),
    ("Because demand for the new {product} exceeded expectations, the purchasing team placed another order ____.", ["prompt", "promptly", "prompted", "prompting"], "B"),
    ("The editorial board praised the report for being concise, accurate, and easy to ____.", ["understand", "understood", "understanding", "understands"], "A"),
    ("Please keep your visitor badge visible ____ you are inside the research facility.", ["during", "while", "until", "before"], "B"),
    ("The renovation schedule has changed slightly, but the grand reopening is still expected to happen ____ June.", ["in", "at", "on", "for"], "A"),
    ("At the end of each shift, employees must check that the lights have been turned off and the doors are securely ____.", ["lock", "locking", "locked", "locks"], "C"),
    ("The bus to the convention center runs every thirty minutes, making it the most ____ option for commuters.", ["convenience", "convenient", "conveniently", "convene"], "B"),
    ("The customer service team responded quickly to the complaint and offered a refund, ____ a replacement item.", ["as well as", "even though", "instead of", "according to"], "A"),
    ("Before the article is published, the copy editor will review it for grammar, style, and factual ____.", ["accurate", "accuracy", "accurately", "accuracies"], "B"),
]


PART6_GROUPS = [
    {
        "title": "Expo registration email",
        "passage": """
        Thank you for registering for the {event}. Your booth assignment will be emailed to you by Friday.

        To make the setup process more efficient, vendors are asked to arrive [1] than 8:30 A.M. on the first day of the event.
        Each booth will already include one table and two chairs, but electrical service must be [2] in advance.
        [3]
        If you have any questions before the showcase opens, please contact our events office by phone or email.
        """,
        "questions": [
            {"prompt": "At [1], choose the best word or phrase.", "choices": ["early", "earlier", "earliest", "more early"], "answer": "B"},
            {"prompt": "At [2], choose the best word or phrase.", "choices": ["request", "requested", "requesting", "requests"], "answer": "B"},
            {"prompt": "At [3], choose the best sentence.", "choices": [
                "Parking coupons can be purchased at the loading gate.",
                "The showcase ended with a fireworks display last year.",
                "Booth walls are painted every two weeks.",
                "Several guests requested vegetarian desserts."
            ], "answer": "A"},
            {"prompt": "At [4], choose the best word or phrase to complete the idea of the passage.", "choices": ["updated", "updating", "updates", "update"], "answer": "A", "support_text": "Which word best describes the assignment information that will be sent by Friday?"},
        ],
    },
    {
        "title": "Office maintenance notice",
        "passage": """
        Beginning next Monday, the first-floor pantry will close for three days while new cabinets are installed.

        During the renovation, employees should use the temporary refreshment area on the fourth floor.
        The facilities team will place signs near the elevators so the alternate location can be found [1].
        Staff members are also reminded to remove any personal items from the pantry shelves before work begins; [2], those items may be stored in labeled boxes by the maintenance crew.
        [3]
        We appreciate your patience and expect the pantry to reopen by Thursday afternoon with additional seating and brighter lighting.
        """,
        "questions": [
            {"prompt": "At [1], choose the best word or phrase.", "choices": ["easy", "ease", "easily", "easier"], "answer": "C"},
            {"prompt": "At [2], choose the best word or phrase.", "choices": ["otherwise", "instead", "similarly", "therefore"], "answer": "A"},
            {"prompt": "At [3], choose the best sentence.", "choices": [
                "Coffee beans from local farms will be sold in the lobby.",
                "Please note that the microwave will remain available in Room 407.",
                "Some employees prefer tea to coffee in the afternoon.",
                "The pantry shelves were delivered last winter."
            ], "answer": "B"},
            {"prompt": "What is the notice mainly about?", "choices": [
                "A pantry renovation",
                "A cafeteria menu change",
                "A new hiring plan",
                "An employee contest"
            ], "answer": "A"},
        ],
    },
    {
        "title": "Magazine article excerpt",
        "passage": """
        The editors of {magazine} recently visited three neighborhood shops that have successfully expanded their businesses without changing their local character.

        One owner explained that the key to growth is listening carefully to returning customers and adjusting services [1].
        Another business improved foot traffic by redesigning its window displays and updating product signs more [2].
        [3]
        Their experiences suggest that small companies can increase revenue while still preserving the personal service that first attracted loyal customers.
        """,
        "questions": [
            {"prompt": "At [1], choose the best word or phrase.", "choices": ["accordingly", "accord", "accords", "accorded"], "answer": "A"},
            {"prompt": "At [2], choose the best word or phrase.", "choices": ["frequent", "frequency", "frequently", "frequencies"], "answer": "C"},
            {"prompt": "At [3], choose the best sentence.", "choices": [
                "Both owners also said that clear communication with staff made daily operations smoother.",
                "The city zoo closes one hour earlier in winter.",
                "A local bakery added six new parking spaces last month.",
                "Retail taxes are calculated differently in coastal regions."
            ], "answer": "A"},
            {"prompt": "What do the owners' experiences suggest?", "choices": [
                "Growth always requires moving to a larger city.",
                "Personal service can support business growth.",
                "Advertising costs should be avoided entirely.",
                "Small companies rarely increase revenue."
            ], "answer": "B"},
        ],
    },
    {
        "title": "Supplier letter",
        "passage": """
        Dear Purchasing Team,

        We are writing to inform you that shipments from {vendor} will arrive one day later than usual for the next two weeks.
        A temporary highway closure near our main distribution center has slowed outbound traffic [1].
        To reduce inconvenience, we will email a revised delivery estimate each morning and provide free upgrades to our [2] service for urgent orders.
        [3]
        Thank you for your understanding as we work to return to our normal schedule.
        """,
        "questions": [
            {"prompt": "At [1], choose the best word or phrase.", "choices": ["notice", "notices", "noticeable", "noticeably"], "answer": "D"},
            {"prompt": "At [2], choose the best word or phrase.", "choices": ["standard", "stand", "standing", "standards"], "answer": "A"},
            {"prompt": "At [3], choose the best sentence.", "choices": [
                "Our customer support team will remain available to answer order-status questions.",
                "Most of our drivers prefer traveling before sunrise in summer.",
                "The new catalog includes fewer pages than last year's edition.",
                "This letter should be printed on blue paper."
            ], "answer": "A"},
            {"prompt": "Why are shipments delayed?", "choices": [
                "A warehouse fire",
                "A computer error",
                "A highway closure",
                "A labor strike"
            ], "answer": "C"},
        ],
    },
]


PART7_GROUPS = [
    {
        "title": "Advertisement",
        "passages": [
            {
                "label": "Advertisement",
                "title": "Summer Auto Supply Service Special",
                "content": """
                Summer Auto Supply
                Service Special

                $29.95

                Service includes:
                - Conventional oil change
                - Premium oil filter change
                - Complimentary car inspection

                This offer is valid only at our Smithville and Parkertown locations through August 31.
                Customers must present this coupon at the time of service. Limit one coupon per customer.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "What service is NOT included with the special?",
                "choices": ["An oil change", "A filter change", "A car inspection", "A car wash"],
                "answer": "D",
            },
            {
                "prompt": "What is indicated about the coupon?",
                "choices": ["It can be used at all locations.", "It is available only to first-time customers.", "It must be used before the end of August.", "It can be used multiple times."],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Email",
        "passages": [
            {
                "label": "Email",
                "title": "Lecture update",
                "content": """
                To: Staff and guests
                Subject: Friday evening lecture

                Please note that this week's public lecture on sustainable packaging will begin at 6:00 P.M. in Hall B.
                Doors will open at 5:30, and attendees may ask questions after the presentation.
                A light reception will be held in the lobby immediately afterward.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "What time will the lecture begin?",
                "choices": ["5:30 P.M.", "6:00 P.M.", "6:30 P.M.", "7:00 P.M."],
                "answer": "B",
            },
            {
                "prompt": "The lecture will take place at 6:00 P.M., ______ which attendees may ask questions.",
                "choices": ["across", "after", "inside", "among"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Notice",
        "passages": [
            {
                "label": "Notice",
                "title": "Staff parking reminder",
                "content": """
                Beginning May 2, the east parking lot will be reserved for delivery vehicles during building renovations.
                Employees should park in the south lot and use the covered walkway near Entrance C.
                Temporary signs will be posted along the road to direct incoming traffic.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "Why is the east parking lot being reserved?",
                "choices": ["For guest speakers", "For delivery vehicles", "For outdoor events", "For maintenance staff only"],
                "answer": "B",
            },
            {
                "prompt": "What are employees advised to do?",
                "choices": ["Arrive after 9:00 A.M.", "Use Entrance A", "Park in the south lot", "Take a shuttle bus"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Article",
        "passages": [
            {
                "label": "Article",
                "title": "Neighborhood market grows with local makers",
                "content": """
                When West Harbor Market first opened, it sold only packaged foods and household basics.
                Over the last three years, however, manager Lena Brooks has invited local artists and small food producers to rent weekend stalls.
                The change has drawn more foot traffic, and nearby cafes now stay open later on market days.
                Brooks says the next step is to add monthly evening events during the summer.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "What is the article mainly about?",
                "choices": ["A market's expansion strategy", "A city's traffic problem", "A food safety concern", "A change in rental laws"],
                "answer": "A",
            },
            {
                "prompt": "What has increased because of the market's change?",
                "choices": ["Weekend stall fees", "Foot traffic", "Delivery costs", "Store closing times"],
                "answer": "B",
            },
            {
                "prompt": "What does Brooks plan to do next?",
                "choices": ["Open a second location", "Reduce weekend rent", "Add summer evening events", "Sell packaged foods online"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Text messages",
        "passages": [
            {
                "label": "Text messages",
                "title": "Delivery coordination",
                "content": """
                9:12 A.M. - Mia: The courier for the display panels is here, but the loading elevator is busy.
                9:13 A.M. - Jonah: Ask the driver to wait ten minutes. The maintenance crew is finishing up.
                9:17 A.M. - Mia: Okay. Should I still send the panels to Booth 14 afterward?
                9:18 A.M. - Jonah: Yes, and leave the spare stand at the registration desk.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "Why is the courier waiting?",
                "choices": ["The booth is locked", "The elevator is occupied", "The driver forgot a package", "The display panels are incomplete"],
                "answer": "B",
            },
            {
                "prompt": "Where should the panels be sent?",
                "choices": ["Booth 14", "The parking lot", "The cafeteria", "Office 3C"],
                "answer": "A",
            },
            {
                "prompt": "What should happen to the spare stand?",
                "choices": ["It should be returned", "It should be repaired", "It should be left at the registration desk", "It should be sold at the booth"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Memo",
        "passages": [
            {
                "label": "Memo",
                "title": "Updated onboarding packet",
                "content": """
                To: Department coordinators
                From: {director}

                We have revised the onboarding packet for new employees to include clearer instructions for remote-access setup.
                Please discard any printed copies dated before March and replace them with the version attached to this memo.
                Coordinators who need extra printed sets should notify the HR desk by Thursday afternoon.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "What has been revised?",
                "choices": ["A travel policy", "An onboarding packet", "A payroll calendar", "A marketing brochure"],
                "answer": "B",
            },
            {
                "prompt": "Which copies should be discarded?",
                "choices": ["Copies printed in blue ink", "Copies dated before March", "Signed copies from HR", "All digital copies"],
                "answer": "B",
            },
            {
                "prompt": "By when should requests for more printed sets be sent?",
                "choices": ["By Thursday afternoon", "By the end of March", "Before noon today", "After orientation begins"],
                "answer": "A",
            },
        ],
    },
    {
        "title": "Web notice",
        "passages": [
            {
                "label": "Web notice",
                "title": "Community workshop registration",
                "content": """
                Registration is now open for the Community Makers Workshop on Saturday, June 8.
                Morning sessions will focus on design planning, and afternoon sessions will feature hands-on demonstrations with local instructors.
                Participants who register by May 20 will receive a digital materials guide before the event.
                Seating is limited, so early registration is recommended.
                """,
            }
        ],
        "questions": [
            {
                "prompt": "What is being announced?",
                "choices": ["A city festival", "A workshop registration period", "A product discount", "A train schedule change"],
                "answer": "B",
            },
            {
                "prompt": "What will afternoon sessions include?",
                "choices": ["Budget meetings", "Hands-on demonstrations", "Award ceremonies", "Vendor interviews"],
                "answer": "B",
            },
            {
                "prompt": "What do early registrants receive?",
                "choices": ["A meal voucher", "A printed ticket", "A digital materials guide", "A parking permit"],
                "answer": "C",
            },
        ],
    },
    {
        "title": "Email exchange",
        "passages": [
            {
                "label": "Email 1",
                "title": "Question about seminar room",
                "content": """
                To: events@{company_short}.com
                From: Priya N.

                Hello,
                My team is registered for next Tuesday's analytics seminar. Our confirmation message lists Room 214,
                but the event page still shows Room 302. Could you confirm which room is correct?
                Thank you,
                Priya
                """,
            },
            {
                "label": "Email 2",
                "title": "Reply",
                "content": """
                To: Priya N.
                From: Event Services

                Hello Priya,
                Thanks for catching that. The seminar was moved to Room 214 after we needed the larger space in Room 302 for another program.
                We have updated the event page, and an automatic reminder will go out to all attendees this afternoon.
                Best,
                Event Services
                """,
            },
        ],
        "questions": [
            {
                "prompt": "Why did Priya write the first email?",
                "choices": ["To request a refund", "To confirm the seminar room", "To change a registration name", "To ask about parking fees"],
                "answer": "B",
            },
            {
                "prompt": "What problem does Event Services mention?",
                "choices": ["The registration system failed", "A speaker canceled", "Two sources listed different rooms", "Room 214 was too small"],
                "answer": "C",
            },
            {
                "prompt": "Why was the seminar moved to Room 214?",
                "choices": ["Room 302 is under repair", "Room 302 is needed for another program", "The speaker requested a smaller room", "Room 214 has newer equipment"],
                "answer": "B",
            },
            {
                "prompt": "What will happen this afternoon?",
                "choices": ["A refund will be processed", "The seminar will begin", "An automatic reminder will be sent", "The event page will be removed"],
                "answer": "C",
            },
            {
                "prompt": "What is suggested about Priya?",
                "choices": ["She is organizing the seminar", "She noticed an inconsistency", "She needs a wheelchair-accessible room", "She is a first-time attendee"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Letter and invoice",
        "passages": [
            {
                "label": "Letter",
                "title": "Supplier notice",
                "content": """
                Dear Purchasing Office,

                Thank you for your recent order of lobby furniture. We have packed all requested items and scheduled delivery for May 6.
                Please note that the floor lamp you selected is temporarily unavailable in walnut finish, so we have placed the oak version on hold for you instead.
                If you prefer to wait for the walnut finish, contact us by Friday and we will adjust the shipment.
                Sincerely,
                FurnishRight
                """,
            },
            {
                "label": "Invoice",
                "title": "Order summary",
                "content": """
                FurnishRight
                Invoice 4472

                2 lounge chairs .......... $540
                1 side table ............. $135
                1 floor lamp (oak) ....... $120
                Delivery charge .......... $45
                Total due ................ $840
                Delivery date ............ May 6
                """,
            },
        ],
        "questions": [
            {
                "prompt": "What item is currently unavailable in the requested finish?",
                "choices": ["A lounge chair", "A side table", "A floor lamp", "A delivery cart"],
                "answer": "C",
            },
            {
                "prompt": "What must the customer do to wait for the walnut finish?",
                "choices": ["Pay an extra fee", "Contact the supplier by Friday", "Visit the showroom in person", "Reject the entire shipment"],
                "answer": "B",
            },
            {
                "prompt": "According to the invoice, what is scheduled for May 6?",
                "choices": ["A design consultation", "The total payment", "The delivery", "A product exchange"],
                "answer": "C",
            },
            {
                "prompt": "How much is the delivery charge?",
                "choices": ["$120", "$135", "$540", "$45"],
                "answer": "D",
            },
            {
                "prompt": "What is indicated about the oak lamp?",
                "choices": ["It replaces the original choice for now", "It is out of stock", "It is more expensive than the chairs", "It will arrive after May 6"],
                "answer": "A",
            },
        ],
    },
    {
        "title": "Notice and schedule",
        "passages": [
            {
                "label": "Notice",
                "title": "Community shuttle service",
                "content": """
                Beginning next week, the community shuttle will stop at the library only on Tuesdays and Thursdays.
                Monday service will end because of low ridership, but an additional Friday trip will be added for the farmers' market.
                Riders should check the updated stop times posted in the lobby before planning their trips.
                """,
            },
            {
                "label": "Schedule",
                "title": "Updated library stop times",
                "content": """
                Tuesday ........ 9:10 A.M.
                Thursday ....... 9:10 A.M.
                Friday ......... 4:40 P.M.
                """,
            },
        ],
        "questions": [
            {
                "prompt": "Why will Monday library service end?",
                "choices": ["The library is closing on Mondays", "Ridership is low", "The shuttle needs repairs", "Drivers requested shorter routes"],
                "answer": "B",
            },
            {
                "prompt": "What new trip is being added?",
                "choices": ["A Sunday morning trip", "A Tuesday evening trip", "A Friday trip", "A Monday afternoon trip"],
                "answer": "C",
            },
            {
                "prompt": "According to the schedule, when does the Friday library stop occur?",
                "choices": ["9:10 A.M.", "12:00 P.M.", "4:40 P.M.", "5:10 P.M."],
                "answer": "C",
            },
            {
                "prompt": "What are riders advised to do?",
                "choices": ["Call the driver directly", "Check the updated stop times", "Purchase tickets in advance", "Use the station entrance"],
                "answer": "B",
            },
            {
                "prompt": "What is likely true about Friday service?",
                "choices": ["It is intended for market visitors", "It replaces Tuesday service", "It only runs in winter", "It starts next month"],
                "answer": "A",
            },
        ],
    },
    {
        "title": "Chat and shipping summary",
        "passages": [
            {
                "label": "Chat",
                "title": "Internal team chat",
                "content": """
                2:03 P.M. - Leo: The client called. They still need the sample kits by tomorrow morning.
                2:05 P.M. - Aria: I can arrange express shipping if the labels are printed in the next twenty minutes.
                2:06 P.M. - Leo: Great. I'll ask the packing team to move your order to the front of the line.
                2:07 P.M. - Aria: Please send me the final quantity before 2:20.
                """,
            },
            {
                "label": "Shipping summary",
                "title": "Order 1882",
                "content": """
                Destination: {city}
                Standard delivery: 2 business days
                Express delivery: Next day by 10:00 A.M.
                Quantity pending confirmation
                Label cutoff: 2:20 P.M.
                """,
            },
        ],
        "questions": [
            {
                "prompt": "What does the client need?",
                "choices": ["A refund", "Sample kits", "A software update", "A site inspection"],
                "answer": "B",
            },
            {
                "prompt": "What must happen within the next twenty minutes?",
                "choices": ["The client must pay", "Labels must be printed", "A driver must arrive", "The warehouse must close"],
                "answer": "B",
            },
            {
                "prompt": "According to the shipping summary, when can express delivery arrive?",
                "choices": ["Tomorrow by 10:00 A.M.", "In two business days", "By 2:20 P.M. today", "Next week"],
                "answer": "A",
            },
            {
                "prompt": "What information does Aria still need?",
                "choices": ["The final quantity", "The delivery address", "The client's phone number", "The invoice total"],
                "answer": "A",
            },
            {
                "prompt": "What will Leo do next?",
                "choices": ["Cancel the order", "Move the order forward in packing", "Drive the shipment himself", "Update the product catalog"],
                "answer": "B",
            },
        ],
    },
    {
        "title": "Press release, email, and agenda",
        "passages": [
            {
                "label": "Press release",
                "title": "New community studio",
                "content": """
                {company} announced today that it will open a public innovation studio inside the restored Harbor Mill building this summer.
                The studio will host maker classes, weekend demonstrations, and talks by local entrepreneurs.
                Company representatives said the goal is to create a place where students, residents, and small businesses can work together on practical projects.
                """,
            },
            {
                "label": "Email",
                "title": "Opening event coordination",
                "content": """
                To: {assistant}
                Subject: Opening event speakers

                Please confirm whether the city arts director can still give the welcome remarks at 10:00 A.M.
                If not, ask the workshop lead to move the first demonstration fifteen minutes earlier so the rest of the agenda stays on track.
                Also, remember to reserve seats in the front row for community partners.
                """,
            },
            {
                "label": "Agenda",
                "title": "Opening day",
                "content": """
                9:30 A.M. Doors open
                10:00 A.M. Welcome remarks
                10:30 A.M. Demo session 1
                11:15 A.M. Partner tour
                12:00 P.M. Networking lunch
                """,
            },
        ],
        "questions": [
            {
                "prompt": "What is the purpose of the press release?",
                "choices": ["To request donations", "To announce a new public studio", "To summarize a workshop", "To advertise a lunch special"],
                "answer": "B",
            },
            {
                "prompt": "What is the stated goal of the studio?",
                "choices": ["To train only company employees", "To store equipment for local schools", "To support collaborative practical projects", "To replace an existing factory"],
                "answer": "C",
            },
            {
                "prompt": "What does the email ask {assistant} to confirm?",
                "choices": ["Whether lunch has been ordered", "Whether the arts director can give remarks", "Whether the building inspection passed", "Whether new signs have arrived"],
                "answer": "B",
            },
            {
                "prompt": "If the arts director is unavailable, what should happen?",
                "choices": ["The tour should be canceled", "The lunch should be moved earlier", "The first demonstration should begin earlier", "The doors should open later"],
                "answer": "C",
            },
            {
                "prompt": "According to the agenda, what happens at 11:15 A.M.?",
                "choices": ["Doors open", "Welcome remarks", "Partner tour", "Networking lunch"],
                "answer": "C",
            },
            {
                "prompt": "Who should have front-row seats reserved?",
                "choices": ["Local media reporters", "Community partners", "City engineers", "New employees"],
                "answer": "B",
            },
            {
                "prompt": "What will likely occur at 10:30 A.M. if the schedule remains unchanged?",
                "choices": ["Demo session 1", "Networking lunch", "Press interviews", "Ticket sales"],
                "answer": "A",
            },
            {
                "prompt": "What is implied about the Harbor Mill building?",
                "choices": ["It was recently restored", "It is located outside the city", "It houses a warehouse only", "It will close after summer"],
                "answer": "A",
            },
        ],
    },
    {
        "title": "Advertisement, coupon, and FAQ",
        "passages": [
            {
                "label": "Advertisement",
                "title": "Weekend maker market",
                "content": """
                Visit the Weekend Maker Market at {venue} to explore handcrafted goods, small-batch foods, and live demonstrations from regional creators.
                The market runs every Saturday in June from 9:00 A.M. to 3:00 P.M.
                Visitors who attend before noon can join a free mini-workshop while space remains available.
                """,
            },
            {
                "label": "Coupon",
                "title": "Workshop voucher",
                "content": """
                Weekend Maker Market
                Free Mini-Workshop Voucher

                Valid for one beginner session only.
                Present this voucher at the workshop desk before 11:45 A.M.
                Limit one voucher per visitor.
                """,
            },
            {
                "label": "FAQ",
                "title": "Visitor information",
                "content": """
                Q: Is parking available?
                A: Yes, paid parking is available in Garage B.

                Q: Are children allowed in the mini-workshops?
                A: Yes, but children under twelve must attend with an adult.

                Q: Can I bring my own materials?
                A: No. All beginner workshops provide the necessary supplies.
                """,
            },
        ],
        "questions": [
            {
                "prompt": "When does the market operate?",
                "choices": ["Every day in June", "Every Saturday in June", "Only on weekends after noon", "Every Friday in summer"],
                "answer": "B",
            },
            {
                "prompt": "What is free for early visitors?",
                "choices": ["Parking in Garage B", "A beginner workshop", "A food sample box", "Admission to a concert"],
                "answer": "B",
            },
            {
                "prompt": "What must a visitor do to use the voucher?",
                "choices": ["Reserve online", "Present it before 11:45 A.M.", "Attend after noon", "Purchase materials first"],
                "answer": "B",
            },
            {
                "prompt": "How many workshop vouchers may each visitor use?",
                "choices": ["One", "Two", "Three", "Unlimited"],
                "answer": "A",
            },
            {
                "prompt": "Where is parking available?",
                "choices": ["Garage A", "Garage B", "Lot C only", "No parking is available"],
                "answer": "B",
            },
            {
                "prompt": "What is required for children under twelve?",
                "choices": ["A signed form", "An adult companion", "A paid ticket", "A separate workshop room"],
                "answer": "B",
            },
            {
                "prompt": "What does the FAQ say about workshop materials?",
                "choices": ["Visitors must bring their own.", "Supplies are sold at a discount.", "Beginner workshops provide them.", "They can only be borrowed in the afternoon."],
                "answer": "C",
            },
            {
                "prompt": "What is implied about the mini-workshops?",
                "choices": ["They have limited capacity.", "They are held on weekdays.", "They are intended for experts only.", "They last all day."],
                "answer": "A",
            },
        ],
    },
]


def block(value: str) -> str:
    return textwrap.dedent(value).strip()


def render(value, profile):
    if isinstance(value, str):
        return block(value).format(**profile)
    if isinstance(value, list):
        return [render(item, profile) for item in value]
    if isinstance(value, dict):
        return {key: render(item, profile) for key, item in value.items()}
    return value


def url_for(relative_path: str) -> str:
    return f"/toeic-official/{relative_path}"


def write_text_asset(relative_path: str, content: str) -> str:
    destination = PUBLIC_ROOT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(content, encoding="utf-8")
    return url_for(relative_path)


def synthesize_audio(relative_path: str, script_text: str) -> str:
    destination = PUBLIC_ROOT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        return url_for(relative_path)
    if not SAY_BIN or not AFCONVERT_BIN:
        destination.write_bytes(b"")
        return url_for(relative_path)
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_aiff = Path(temp_dir) / "voice.aiff"
        subprocess.run(
            [SAY_BIN, "-v", "Samantha", "-r", "185", "-o", str(temp_aiff), script_text],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        subprocess.run(
            [AFCONVERT_BIN, "-f", "WAVE", "-d", "LEI16", str(temp_aiff), str(destination)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    return url_for(relative_path)


def photo_svg(kind: str, caption: str) -> str:
    shapes = {
        "pouring": """
          <circle cx="140" cy="138" r="34" fill="#d7d7d7" />
          <path d="M90 210 L155 162 L205 255 L115 292 Z" fill="#b8b8b8" />
          <rect x="232" y="212" width="110" height="58" rx="12" fill="#8f8f8f" />
          <rect x="255" y="170" width="42" height="72" rx="8" fill="#d9d9d9" transform="rotate(-18 276 206)" />
        """,
        "warehouse": """
          <rect x="94" y="96" width="256" height="210" rx="8" fill="#8d8d8d" />
          <line x1="94" y1="168" x2="350" y2="168" stroke="#f1f1f1" stroke-width="6" />
          <line x1="94" y1="238" x2="350" y2="238" stroke="#f1f1f1" stroke-width="6" />
          <rect x="116" y="116" width="52" height="38" rx="4" fill="#d2d2d2" />
          <rect x="190" y="116" width="52" height="38" rx="4" fill="#c1c1c1" />
          <rect x="264" y="186" width="52" height="38" rx="4" fill="#d6d6d6" />
        """,
        "board": """
          <rect x="180" y="88" width="180" height="72" rx="10" fill="#7f7f7f" />
          <rect x="198" y="106" width="48" height="16" rx="4" fill="#dfdfdf" />
          <rect x="258" y="106" width="78" height="16" rx="4" fill="#cfcfcf" />
          <circle cx="128" cy="234" r="24" fill="#d5d5d5" />
          <rect x="112" y="260" width="36" height="84" rx="14" fill="#afafaf" />
          <circle cx="392" cy="242" r="24" fill="#dcdcdc" />
          <rect x="376" y="268" width="34" height="76" rx="14" fill="#b6b6b6" />
        """,
        "panel": """
          <rect x="208" y="88" width="132" height="180" rx="10" fill="#7f7f7f" />
          <rect x="226" y="108" width="34" height="24" rx="4" fill="#d9d9d9" />
          <rect x="270" y="108" width="54" height="24" rx="4" fill="#c4c4c4" />
          <circle cx="140" cy="150" r="28" fill="#d7d7d7" />
          <path d="M96 242 L150 184 L196 308 L116 338 Z" fill="#b8b8b8" />
        """,
        "kitchen": """
          <rect x="194" y="106" width="146" height="182" rx="16" fill="#858585" />
          <rect x="214" y="134" width="108" height="86" rx="10" fill="#d9d9d9" />
          <rect x="236" y="246" width="70" height="18" rx="8" fill="#d0d0d0" />
          <circle cx="120" cy="150" r="30" fill="#d6d6d6" />
          <path d="M86 236 L148 182 L206 316 L118 348 Z" fill="#b2b2b2" />
        """,
        "bike": """
          <circle cx="162" cy="276" r="46" fill="none" stroke="#898989" stroke-width="8" />
          <circle cx="312" cy="276" r="46" fill="none" stroke="#898989" stroke-width="8" />
          <path d="M162 276 L216 214 L268 214 L312 276 L250 276 Z" fill="none" stroke="#cfcfcf" stroke-width="8" />
          <circle cx="96" cy="154" r="28" fill="#d7d7d7" />
          <path d="M60 238 L118 184 L156 308 L82 338 Z" fill="#b0b0b0" />
        """,
    }
    body = shapes.get(kind, shapes["pouring"])
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 520">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#f0f0f0"/>
      <stop offset="100%" stop-color="#c9c9c9"/>
    </linearGradient>
  </defs>
  <rect width="720" height="520" rx="28" fill="url(#bg)" />
  <rect x="26" y="26" width="668" height="468" rx="20" fill="rgba(255,255,255,0.15)" stroke="#f8f8f8" stroke-width="4" />
  {body}
  <rect x="52" y="428" width="616" height="46" rx="14" fill="rgba(40,40,40,0.64)" />
  <text x="360" y="458" font-size="24" font-family="Arial, sans-serif" text-anchor="middle" fill="#ffffff">{html.escape(caption)}</text>
</svg>"""


def table_svg(title: str, headers: list[str], rows: list[list[str]], note: str = "") -> str:
    cell_w = 190
    width = 110 + cell_w * len(headers)
    row_h = 58
    height = 170 + row_h * len(rows)
    columns = []
    for index, header in enumerate(headers):
        x = 60 + cell_w * index
        columns.append(f'<text x="{x + 20}" y="102" font-size="24" font-family="Arial, sans-serif" font-weight="700" fill="#13263f">{html.escape(header)}</text>')
    row_lines = []
    for row_index, row in enumerate(rows):
        y = 126 + row_h * row_index
        row_lines.append(f'<rect x="48" y="{y - 28}" width="{width - 96}" height="{row_h}" fill="{ "#f7faff" if row_index % 2 == 0 else "#eef4ff"}" />')
        for col_index, cell in enumerate(row):
            x = 60 + cell_w * col_index
            row_lines.append(f'<text x="{x + 20}" y="{y + 8}" font-size="22" font-family="Arial, sans-serif" fill="#26384f">{html.escape(str(cell))}</text>')
    note_text = f'<text x="{width - 52}" y="{height - 24}" font-size="20" text-anchor="end" font-family="Arial, sans-serif" fill="#6b7d94">{html.escape(note)}</text>' if note else ""
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}">
  <rect width="{width}" height="{height}" rx="26" fill="#ffffff" stroke="#dbe6fb" stroke-width="6" />
  <text x="48" y="48" font-size="30" font-family="Arial, sans-serif" font-weight="700" fill="#1a2d46">{html.escape(title)}</text>
  <rect x="48" y="66" width="{width - 96}" height="58" rx="16" fill="#dfe9ff" />
  {''.join(columns)}
  {''.join(row_lines)}
  {note_text}
</svg>"""


def create_photo_asset(profile: dict[str, str], scene: dict[str, str]) -> str:
    relative_path = f"images/{profile['id']}/{scene['asset']}.svg"
    content = photo_svg(scene["kind"], scene["caption"])
    return write_text_asset(relative_path, content)


def create_graphic_asset(profile: dict[str, str], graphic: dict[str, object]) -> str:
    rendered = render(graphic, profile)
    relative_path = f"graphics/{profile['id']}/{rendered['asset']}.svg"
    content = table_svg(rendered["title"], rendered["headers"], rendered["rows"], rendered.get("note", ""))
    return write_text_asset(relative_path, content)


def make_audio_url(profile: dict[str, str], part_label: str, index: int, transcript: str) -> str:
    relative_path = f"audio/{profile['id']}/{part_label}-{index:02d}.wav"
    return synthesize_audio(relative_path, transcript.replace("\n", " "))


def make_question(prompt: str, choices: list[str], answer: str, support_text: str = "") -> dict[str, object]:
    payload = {
        "prompt": prompt,
        "choices": [{"key": chr(65 + idx), "text": choice} for idx, choice in enumerate(choices)],
        "answer_key": answer,
    }
    if support_text:
        payload["support_text"] = support_text
    return payload


def build_part1(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for index, raw_scene in enumerate(PHOTO_SCENES, start=1):
        scene = render(raw_scene, profile)
        transcript = " ".join(scene["options"])
        groups.append(
            {
                "title": f"Photograph {index}",
                "audio_url": make_audio_url(profile, "part1", index, transcript),
                "image_url": create_photo_asset(profile, scene),
                "transcript": transcript,
                "questions": [
                    make_question("", scene["options"], scene["answer"])
                ],
            }
        )
    return {
        "part_number": 1,
        "title": "Photographs",
        "directions": "Select the one statement that best describes what you see in the picture.",
        "groups": groups,
    }


def build_part2(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for index, raw_item in enumerate(PART2_ITEMS, start=1):
        item = render(raw_item, profile)
        transcript = " ".join([item["prompt"], *item["choices"]])
        groups.append(
            {
                "title": f"Question-Response {index}",
                "audio_url": make_audio_url(profile, "part2", index, transcript),
                "transcript": transcript,
                "questions": [
                    make_question("", item["choices"], item["answer"])
                ],
            }
        )
    return {
        "part_number": 2,
        "title": "Question-Response",
        "directions": "Select the best response to each question.",
        "groups": groups,
    }


def build_part3(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for index, raw_group in enumerate(PART3_GROUPS, start=1):
        group = render(raw_group, profile)
        transcript = group["transcript"]
        payload = {
            "title": group["title"],
            "audio_url": make_audio_url(profile, "part3", index, transcript),
            "transcript": transcript,
            "questions": [make_question(item["prompt"], item["choices"], item["answer"]) for item in group["questions"]],
        }
        if group.get("graphic"):
            payload["graphic_url"] = create_graphic_asset(profile, group["graphic"])
        groups.append(payload)
    return {
        "part_number": 3,
        "title": "Conversations",
        "directions": "Select the best response to each question.",
        "groups": groups,
    }


def build_part4(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for index, raw_group in enumerate(PART4_GROUPS, start=1):
        group = render(raw_group, profile)
        transcript = group["transcript"]
        payload = {
            "title": group["title"],
            "audio_url": make_audio_url(profile, "part4", index, transcript),
            "transcript": transcript,
            "questions": [make_question(item["prompt"], item["choices"], item["answer"]) for item in group["questions"]],
        }
        if group.get("graphic"):
            payload["graphic_url"] = create_graphic_asset(profile, group["graphic"])
        groups.append(payload)
    return {
        "part_number": 4,
        "title": "Talks",
        "directions": "Select the best response to each question.",
        "groups": groups,
    }


def build_part5(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for index, (prompt, choices, answer) in enumerate(PART5_ITEMS, start=1):
        rendered_prompt = render(prompt, profile)
        rendered_choices = render(choices, profile)
        groups.append(
            {
                "title": f"Incomplete sentence {index}",
                "questions": [make_question(rendered_prompt, rendered_choices, answer)],
            }
        )
    return {
        "part_number": 5,
        "title": "Incomplete Sentences",
        "directions": "Select the best answer to complete the sentence.",
        "groups": groups,
    }


def build_part6(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for raw_group in PART6_GROUPS:
        group = render(raw_group, profile)
        groups.append(
            {
                "title": group["title"],
                "passages": [
                    {
                        "label": "Text",
                        "title": group["title"],
                        "content": group["passage"],
                    }
                ],
                "questions": [
                    make_question(item["prompt"], item["choices"], item["answer"], item.get("support_text", ""))
                    for item in group["questions"]
                ],
            }
        )
    return {
        "part_number": 6,
        "title": "Text Completion",
        "directions": "Read the text and select the best answer for each blank.",
        "groups": groups,
    }


def build_part7(profile: dict[str, str]) -> dict[str, object]:
    groups = []
    for raw_group in PART7_GROUPS:
        group = render(raw_group, profile)
        groups.append(
            {
                "title": group["title"],
                "passages": group["passages"],
                "questions": [make_question(item["prompt"], item["choices"], item["answer"]) for item in group["questions"]],
            }
        )
    return {
        "part_number": 7,
        "title": "Reading Comprehension",
        "directions": "Read the following text or set of texts and answer the questions.",
        "groups": groups,
    }


def build_document(profile: dict[str, str]) -> dict[str, object]:
    listening_parts = [build_part1(profile), build_part2(profile), build_part3(profile), build_part4(profile)]
    reading_parts = [build_part5(profile), build_part6(profile), build_part7(profile)]
    return {
        "id": profile["id"],
        "series": profile["series"],
        "title": profile["title"],
        "status": profile["status"],
        "description": profile["focus"],
        "form": profile["form"],
        "locale": profile["locale"],
        "month": profile["month"],
        "year": profile["year"],
        "duration_minutes": 120,
        "listening": {
            "title": "Listening",
            "duration_minutes": 45,
            "parts": listening_parts,
        },
        "reading": {
            "title": "Reading",
            "duration_minutes": 75,
            "parts": reading_parts,
        },
    }


def count_questions(document: dict[str, object]) -> int:
    total = 0
    for section_key in ("listening", "reading"):
        section = document.get(section_key, {})
        for part in section.get("parts", []):
            for group in part.get("groups", []):
                total += len(group.get("questions", []))
    return total


def assert_document_shape(document: dict[str, object]) -> None:
    total = count_questions(document)
    if total != 200:
        raise ValueError(f"{document['id']} has {total} questions instead of 200")

    listening_total = sum(
        len(group.get("questions", []))
        for part in document["listening"]["parts"]
        for group in part["groups"]
    )
    reading_total = sum(
        len(group.get("questions", []))
        for part in document["reading"]["parts"]
        for group in part["groups"]
    )
    if listening_total != 100:
        raise ValueError(f"{document['id']} listening total is {listening_total}")
    if reading_total != 100:
        raise ValueError(f"{document['id']} reading total is {reading_total}")


def main() -> None:
    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    documents = [build_document(profile) for profile in TEST_PROFILES]
    for document in documents:
        assert_document_shape(document)

    state = {
        "packs": [],
        "deleted_pack_ids": [],
        "themes": [],
        "question_bank": {},
        "exam_documents": documents,
        "import_history": [
            {
                "source": "seed-script",
                "packs_imported": len(documents),
                "themes_imported": 0,
                "documents_imported": len(documents),
            }
        ],
    }
    DATA_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=True), encoding="utf-8")
    print(f"Seeded {len(documents)} TOEIC full tests to {DATA_FILE}")


if __name__ == "__main__":
    main()
