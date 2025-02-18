import React, { useState, useEffect } from "react";
import axios from "axios";

interface IResponse {
  content: string;
}

const App: React.FC = () => {
  const [teachingStyle, setTeachingStyle] = useState<string[]>([]);
  const [objectives, setObjectives] = useState<string>("");
  const [grade, setGrade] = useState<string>("1st Grade");
  const [subject, setSubject] = useState<string>("Mathematics");
  const [language, setLanguage] = useState<string>("English");
  const [mode, setMode] = useState<string>("Learn Concept");
  const [userInput, setUserInput] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [showDownload, setShowDownload] = useState<boolean>(false);
  const [pdfUrl, setPdfUrl] = useState<string>("");

  // Function to handle input change for teaching styles
  const handleTeachingStyleChange = (selectedStyles: string[]) => {
    setTeachingStyle(selectedStyles);
  };

  // Function to handle input change for user input (question or curriculum)
  const handleUserInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  // Generate AI response
  const generateAIResponse = async () => {
    try {
      const prompt = {
        mode,
        grade,
        subject,
        language,
        userInput,
        teachingStyle,
      };
      console.log(prompt)
      const { data } = await axios.post<IResponse>("http://localhost:8000/api/generateResponse", prompt);
      setResponse(data.content);
    } catch (error) {
      console.error("Error fetching AI response", error);
    }
  };

  // Generate curriculum PDF (simulating the PDF generation feature)
  const generateCurriculumPDF = async () => {
    try {
      const curriculumData = {
        grade,
        subject,
        language,
        durationUnit,
        durationValue,
      };
      const { data } = await axios.post("http://localhost:8000/api/generateCirriculum", curriculumData, {
        responseType: "blob",
      });

      console.log(data);

      const pdfBlob = new Blob([data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setShowDownload(true);
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const [durationValue, setDurationValue] = useState<number>(1);
  const [durationUnit, setDurationUnit] = useState<string>("months");  

  return (
    <div className="min-h-screen bg-black text-orange-500">
      {/* Header Section */}
      <header className="bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 mb-4 tracking-tight">
            Tutor.AI
          </h1>
          <p className="mt-2 text-2xl text-orange-500">Made for teachers, for the students</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Configuration Section */}
            <section className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-500">Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-orange-500">Teaching Styles</label>
                  <select 
                    multiple 
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-orange-500 focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => handleTeachingStyleChange([...e.target.selectedOptions].map(o => o.value))}
                  >
                    <option value="Visual">Visual</option>
                    <option value="Auditory">Auditory</option>
                    <option value="Kinesthetic">Kinesthetic</option>
                    <option value="Reading/Writing">Reading/Writing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-orange-500">Learning Objectives</label>
                  <textarea 
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-orange-500 focus:border-indigo-500 focus:ring-indigo-500"
                    rows={4}
                    placeholder="Enter key learning objectives"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Parameters Section */}
            <section className="bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-orange-500">Parameters</h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-orange-500">Grade</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-orange-500 focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setGrade(e.target.value)} 
                    value={grade}
                  >
                    <option value="1st Grade">1st Grade</option>
                    <option value="2nd Grade">2nd Grade</option>
                    <option value="3rd Grade">3rd Grade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-orange-500">Subject</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-orange-500 focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setSubject(e.target.value)} 
                    value={subject}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-orange-500">Language</label>
                  <select 
                    className="mt-1 block w-full rounded-md border-gray-700 bg-gray-700 text-orange-500 focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setLanguage(e.target.value)} 
                    value={language}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Mode Section */}
            <section className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-orange-500">Mode</h2>
      <div className="flex space-x-4">
        <label className="inline-flex items-center text-orange-500">
          <input
            type="radio"
            className="form-radio text-indigo-600"
            name="mode"
            value="Learn Concept"
            checked={mode === "Learn Concept"}
            onChange={() => setMode("Learn Concept")}
          />
          <span className="ml-2">Learn Concept</span>
        </label>

        <label className="inline-flex items-center text-orange-500">
          <input
            type="radio"
            className="form-radio text-indigo-600"
            name="mode"
            value="Generate Curriculum"
            checked={mode === "Generate Curriculum"}
            onChange={() => setMode("Generate Curriculum")}
          />
          <span className="ml-2">Generate Curriculum</span>
        </label>
      </div>

      {mode === "Generate Curriculum" && (
  <div className="mt-4 flex space-x-4">
    {/* Duration Value Dropdown */}
    <div>
      <label className="block text-orange-500 mb-1">Duration:</label>
      <select
        className="bg-gray-700 text-white p-2 rounded"
        value={durationValue}
        onChange={(e) => setDurationValue(Number(e.target.value))} // Convert string to number
      >
        {[...Array(12).keys()].map((num) => (
          <option key={num + 1} value={num + 1}>
            {num + 1}
          </option>
        ))}
      </select>
    </div>

    {/* Duration Unit Dropdown */}
    <div>
      <label className="block text-orange-500 mb-1">Unit:</label>
      <select
        className="bg-gray-700 text-white p-2 rounded"
        value={durationUnit}
        onChange={(e) => setDurationUnit(e.target.value)}
      >
        <option value="days">Days</option>
        <option value="months">Months</option>
        <option value="years">Years</option>
      </select>
    </div>
  </div>
)}

    </section>

            {/* Input Section */}
            <section className="bg-gray-800 rounded-lg shadow p-6">
              <textarea
                className="w-full h-32 p-2 border rounded-md bg-gray-700 text-orange-500 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={mode === "Generate Curriculum" ? "Add specific requirements or notes" : "Enter your question"}
                value={userInput}
                onChange={handleUserInputChange}
              />

              <div className="mt-4 space-x-4">
                <button
                  onClick={generateAIResponse}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Generate Response
                </button>

                {mode === "Generate Curriculum" && (
                  <button
                    onClick={generateCurriculumPDF}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Generate PDF
                  </button>
                )}
              </div>
            </section>

            {/* AI Response Section */}
            {response && (
              <section className="bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-orange-500">AI Response</h2>
                <p className="text-orange-500">{response}</p>
              </section>
            )}

            {/* Download Link for PDF */}
            {showDownload && (
              <section className="bg-gray-800 rounded-lg shadow p-6">
                <a
                  href={pdfUrl}
                  download="curriculum.pdf"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Download PDF
                </a>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
