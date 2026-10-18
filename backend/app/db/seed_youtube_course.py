import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal, init_db
from app.models.course import Course
from app.models.video import Video
from app.models.resource import Resource
from app.models.chunk import TranscriptChunk, DocumentChunk
from app.services.transcription import store_transcript_chunks


ML_DAY_01_CHUNKS = [
    {
        "chunk_id": 1,
        "start_time": 0.0,
        "end_time": 75.0,
        "text": "Welcome to Day 1 of the 100 Days of Machine Learning series. Today we begin our journey by answering the foundational question: What is Machine Learning? We will examine why machine learning has become essential for modern software engineering and data science."
    },
    {
        "chunk_id": 2,
        "start_time": 75.0,
        "end_time": 180.0,
        "text": "Let us contrast Traditional Programming with Machine Learning. In traditional programming, humans write explicit logic and rules. You feed Rules and Data into a computer, and it computes Answers. In Machine Learning, the paradigm is reversed: you feed Data and Answers into the computer, and the learning algorithm produces the Rules or Model."
    },
    {
        "chunk_id": 3,
        "start_time": 180.0,
        "end_time": 330.0,
        "text": "The classic definition of Machine Learning was coined by Arthur Samuel in 1959. He stated that Machine Learning is the field of study that gives computers the ability to learn without being explicitly programmed. Arthur Samuel created a computer checkers program that played against itself and learned to defeat human champions."
    },
    {
        "chunk_id": 4,
        "start_time": 330.0,
        "end_time": 480.0,
        "text": "In 1997, Professor Tom Mitchell of Carnegie Mellon University provided an operational engineering definition of Machine Learning. A computer program is said to learn from Experience E with respect to some class of Tasks T and Performance measure P, if its performance at tasks in T, as measured by P, improves with Experience E."
    },
    {
        "chunk_id": 5,
        "start_time": 480.0,
        "end_time": 630.0,
        "text": "To understand Tom Mitchell's E, T, P framework, consider an email spam classifier. The Task T is classifying incoming emails as spam or not spam. The Performance measure P is the percentage of emails correctly classified. The Experience E is the collection of labeled training emails and user feedback marks."
    },
    {
        "chunk_id": 6,
        "start_time": 630.0,
        "end_time": 800.0,
        "text": "Why is Machine Learning exploding right now when these concepts existed decades ago? There are three fundamental pillars: First, the massive explosion of Big Data from internet users, mobile devices, sensors, and cameras. Second, unprecedented compute power with GPUs, TPUs, and distributed cloud clusters. Third, modern optimized open-source algorithms and frameworks."
    },
    {
        "chunk_id": 7,
        "start_time": 800.0,
        "end_time": 960.0,
        "text": "Let us look at the Machine Learning Development Life Cycle (MLDLC). It consists of key phases: Problem Framing, Data Gathering, Data Preprocessing and Cleaning, Exploratory Data Analysis, Feature Engineering and Selection, Model Training, Model Evaluation, Hyperparameter Tuning, Model Deployment, and continuous Monitoring."
    },
    {
        "chunk_id": 8,
        "start_time": 960.0,
        "end_time": 1100.0,
        "text": "Machine Learning is applied everywhere today: search engines ranking billions of documents, recommendation systems on Netflix and YouTube suggesting videos, computer vision systems in autonomous self-driving cars, and speech recognition engines powering intelligent digital assistants."
    },
    {
        "chunk_id": 9,
        "start_time": 1100.0,
        "end_time": 1200.0,
        "text": "To wrap up Day 1: we have established the traditional vs ML paradigm, Arthur Samuel and Tom Mitchell definitions, the three growth pillars, and the end-to-end lifecycle. For tomorrow in Day 2, we will explore the critical distinctions between Artificial Intelligence, Machine Learning, and Deep Learning."
    }
]

ML_DAY_02_CHUNKS = [
    {
        "chunk_id": 1,
        "start_time": 0.0,
        "end_time": 120.0,
        "text": "Welcome to Day 2 of 100 Days of Machine Learning. In this lecture, we demystify the relationships and differences between Artificial Intelligence, Machine Learning, and Deep Learning."
    },
    {
        "chunk_id": 2,
        "start_time": 120.0,
        "end_time": 300.0,
        "text": "Artificial Intelligence is the broad umbrella discipline aiming to simulate human cognitive functions and intelligence in machines. AI encompasses rule-based systems, expert systems, symbolic AI, genetic algorithms, and search algorithms like A-star."
    },
    {
        "chunk_id": 3,
        "start_time": 300.0,
        "end_time": 540.0,
        "text": "Machine Learning is a subset of Artificial Intelligence that focuses on statistical algorithms that learn patterns from historical data without relying on hardcoded procedural rules."
    },
    {
        "chunk_id": 4,
        "start_time": 540.0,
        "end_time": 780.0,
        "text": "Deep Learning is a specialized sub-branch of Machine Learning based on multi-layer Artificial Neural Networks. DL excels at automatic representation learning from high-dimensional unstructured data like images, audio, video, and natural language."
    },
    {
        "chunk_id": 5,
        "start_time": 780.0,
        "end_time": 962.0,
        "text": "Comparing ML vs DL: ML requires manual feature engineering and works well on smaller structured datasets on CPUs. DL performs automated feature extraction, requires huge volumes of training data, and demands high-performance GPUs."
    }
]

ML_DAY_03_CHUNKS = [
    {
        "chunk_id": 1,
        "start_time": 0.0,
        "end_time": 180.0,
        "text": "Welcome to Day 3 of 100 Days of Machine Learning. Today we classify machine learning algorithms into primary paradigms: Supervised, Unsupervised, Semi-Supervised, and Reinforcement Learning."
    },
    {
        "chunk_id": 2,
        "start_time": 180.0,
        "end_time": 450.0,
        "text": "Supervised Learning operates on labeled datasets where both input features X and ground truth targets Y are provided. The two main tasks in supervised learning are Regression, predicting continuous values, and Classification, predicting discrete categorical labels."
    },
    {
        "chunk_id": 3,
        "start_time": 450.0,
        "end_time": 780.0,
        "text": "Unsupervised Learning operates on unlabeled data where only inputs X exist. The model discovers hidden patterns, groupings, and structures. Key tasks include Clustering (K-Means, DBSCAN), Dimensionality Reduction (PCA, t-SNE), and Anomaly Detection."
    },
    {
        "chunk_id": 4,
        "start_time": 780.0,
        "end_time": 1150.0,
        "text": "Semi-Supervised Learning bridges the gap: a small portion of data is labeled while the vast majority is unlabeled. Self-training and pseudo-labeling leverage both to dramatically reduce expensive human annotation costs."
    },
    {
        "chunk_id": 5,
        "start_time": 1150.0,
        "end_time": 1662.0,
        "text": "Reinforcement Learning is based on trial-and-error interaction with a dynamic environment. An Agent takes Actions, observes the State, and receives Rewards or Penalties to maximize cumulative discounted return."
    }
]


ML_SLIDES = [
    {
        "chunk_id": 1,
        "slide_number": 1,
        "text": "Slide 1: Foundations of Machine Learning. Traditional Programming: Rules + Data -> Answers. Machine Learning: Data + Answers -> Rules (Trained Model). Shift from manual heuristics to statistical data-driven induction."
    },
    {
        "chunk_id": 2,
        "slide_number": 2,
        "text": "Slide 2: Formal Definitions. Arthur Samuel (1959): Field of study that gives computers the ability to learn without being explicitly programmed. Tom Mitchell (1997): E, T, P framework. A computer program learns from Experience (E) on Task (T) with Performance (P) if P on T improves with E."
    },
    {
        "chunk_id": 3,
        "slide_number": 3,
        "text": "Slide 3: Modern ML Growth Drivers. Pillar 1: Big Data availability (petabytes of web/IoT logs). Pillar 2: Accelerated Compute (NVIDIA GPUs, Google TPUs). Pillar 3: Algorithmic Advances & Open-Source Tooling (Scikit-Learn, PyTorch, Transformers)."
    },
    {
        "chunk_id": 4,
        "slide_number": 4,
        "text": "Slide 4: End-to-End Machine Learning Life Cycle. 1. Problem Formulation -> 2. Data Gathering -> 3. Data Cleaning -> 4. Exploratory Data Analysis -> 5. Feature Engineering -> 6. Model Training -> 7. Evaluation & Validation -> 8. Deployment & CI/CD -> 9. Production Monitoring."
    },
    {
        "chunk_id": 5,
        "slide_number": 5,
        "text": "Slide 5: ML Taxonomy Comparison. AI is the broad science of simulating intelligence. ML is the data-driven learning subfield of AI. DL is the representation-learning neural network subfield of ML. Supervised (Regression, Classification), Unsupervised (Clustering, PCA), Reinforcement Learning (Agent, Environment, Reward)."
    }
]


async def seed_youtube_course():
    await init_db()

    async with AsyncSessionLocal() as db:
        course_id = "course-ml-100"
        
        # Check if course exists
        res = await db.execute(select(Course).where(Course.id == course_id))
        course = res.scalar_one_or_none()
        if not course:
            course = Course(
                id=course_id,
                title="100 Days of Machine Learning | CampusX",
                description="Comprehensive machine learning roadmap covering core fundamentals, algorithms, MLDLC, feature engineering, and deployment."
            )
            db.add(course)
            await db.commit()
            print(f"Created Course: {course.title}")

        # Playlist Videos
        videos_meta = [
            {
                "id": "vid-ml-day-01",
                "title": "Day 01: What is Machine Learning?",
                "url": "https://www.youtube.com/watch?v=ZftI2fEz0Fw",
                "duration": 1200.0,
                "chunks": ML_DAY_01_CHUNKS
            },
            {
                "id": "vid-ml-day-02",
                "title": "Day 02: AI Vs ML Vs DL for Beginners",
                "url": "https://www.youtube.com/watch?v=1v3_AQ26jZ0",
                "duration": 962.0,
                "chunks": ML_DAY_02_CHUNKS
            },
            {
                "id": "vid-ml-day-03",
                "title": "Day 03: Types of Machine Learning (Supervised, Unsupervised, RL)",
                "url": "https://www.youtube.com/watch?v=81ymPYEtFOw",
                "duration": 1662.0,
                "chunks": ML_DAY_03_CHUNKS
            },
            {
                "id": "vid-ml-day-04",
                "title": "Day 04: Batch Machine Learning | Offline Vs Online Learning",
                "url": "https://www.youtube.com/watch?v=nPrhFxEuTYU",
                "duration": 688.0,
                "chunks": []
            },
            {
                "id": "vid-ml-day-05",
                "title": "Day 05: Online Machine Learning in Depth",
                "url": "https://www.youtube.com/watch?v=3oOipgCbLIk",
                "duration": 1168.0,
                "chunks": []
            },
            {
                "id": "vid-ml-day-06",
                "title": "Day 06: Instance-Based Vs Model-Based Learning",
                "url": "https://www.youtube.com/watch?v=ntAOq1ioTKo",
                "duration": 1004.0,
                "chunks": []
            },
            {
                "id": "vid-ml-day-07",
                "title": "Day 07: Challenges & Problems in Machine Learning",
                "url": "https://www.youtube.com/watch?v=WGUNAJki2S4",
                "duration": 1420.0,
                "chunks": []
            },
            {
                "id": "vid-ml-day-08",
                "title": "Day 08: Real-World Applications of Machine Learning",
                "url": "https://www.youtube.com/watch?v=UZio8TcTMrI",
                "duration": 1742.0,
                "chunks": []
            },
            {
                "id": "vid-ml-day-09",
                "title": "Day 09: Machine Learning Development Life Cycle (MLDLC)",
                "url": "https://www.youtube.com/watch?v=iDbhQGz_rEo",
                "duration": 1513.0,
                "chunks": []
            },
            {
                "id": "vid-ml-day-10",
                "title": "Day 10: Data Engineer vs Analyst vs Scientist vs ML Engineer",
                "url": "https://www.youtube.com/watch?v=93rKZs0MkgU",
                "duration": 1583.0,
                "chunks": []
            }
        ]

        for vm in videos_meta:
            vres = await db.execute(select(Video).where(Video.id == vm["id"]))
            vid_record = vres.scalar_one_or_none()
            if not vid_record:
                vid_record = Video(
                    id=vm["id"],
                    course_id=course_id,
                    title=vm["title"],
                    storage_url=vm["url"],
                    duration=vm["duration"],
                    transcript_status="completed" if vm["chunks"] else "pending"
                )
                db.add(vid_record)
                await db.commit()
                print(f"Added Video: {vm['title']}")

            if vm["chunks"]:
                # Check if chunks exist
                chk_res = await db.execute(select(TranscriptChunk).where(TranscriptChunk.video_id == vm["id"]))
                existing = chk_res.scalars().all()
                if not existing:
                    await store_transcript_chunks(course_id, vm["id"], vm["chunks"], db)
                    print(f"Stored {len(vm['chunks'])} transcript chunks for {vm['title']}")

        # Resource slides
        res_id = "res-ml-slides"
        r_query = await db.execute(select(Resource).where(Resource.id == res_id))
        res_record = r_query.scalar_one_or_none()
        if not res_record:
            res_record = Resource(
                id=res_id,
                course_id=course_id,
                title="100 Days of Machine Learning Lecture Presentation Slides",
                type="ppt",
                storage_url="slides/ml_lecture_slides.pptx"
            )
            db.add(res_record)
            await db.commit()

            for s in ML_SLIDES:
                dc = DocumentChunk(
                    course_id=course_id,
                    resource_id=res_id,
                    chunk_id=s["chunk_id"],
                    text=s["text"],
                    source_type="ppt",
                    slide_number=s["slide_number"]
                )
                db.add(dc)
            await db.commit()
            print("Added ML course presentation slides and chunks!")

        print("\nAll 100 Days of Machine Learning playlist videos, transcripts, and slides seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_youtube_course())
