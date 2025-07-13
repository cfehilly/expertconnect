// src/components/ExpertiseEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { SAAS_SKILLS_DATA, SkillItem } from '../data/saasSkills'; // Import structured skills data

interface ExpertiseEditorProps {
  currentExpertise: string[];
  onSave: (newExpertise: string[]) => void;
  onCancel: () => void;
  userDepartment?: string; // Pass user's department for contextual suggestions
}

// Helper function to get initial suggestions based on department or overall
const getInitialSkillSuggestions = (
  department: string | undefined, 
  existingSkills: string[], 
  allSkillsData: SkillItem[]
): string[] => {
  const suggestions: Set<string> = new Set();
  const lowerCaseDepartment = department?.toLowerCase() || '';

  // 1. Try to get department-specific suggestions first (up to ~5)
  if (lowerCaseDepartment) {
    const departmentSpecific = allSkillsData
      .filter(skill => 
        skill.categories.some(cat => cat.toLowerCase().includes(lowerCaseDepartment) || lowerCaseDepartment.includes(cat.toLowerCase())) &&
        !existingSkills.includes(skill.name)
      )
      .map(skill => skill.name);
    
    // Add a few department-specific ones
    departmentSpecific.slice(0, 5).forEach(s => suggestions.add(s));
  }

  // 2. Fill up to desired count with overall common skills (if department suggestions are not enough or no department)
  // Define some common skills generally relevant to SaaS (can be customized)
  const overallCommonSkills = [
    "Project Management", "Communication", "Problem-Solving", "SQL", "React", 
    "AWS", "Marketing Strategy", "Sales Strategy", "Customer Success Management (CSM)",
    "Data Analysis", "Figma", "Jira", "Microsoft Excel", "Python", "Node.js", "UX Design"
  ];

  for (const skill of overallCommonSkills) {
    if (suggestions.size >= 8) break; // Limit total initial suggestions
    if (!existingSkills.includes(skill) && !suggestions.has(skill)) {
      suggestions.add(skill);
    }
  }

  // If still less than 8, add some random ones from the full list (not department specific)
  if (suggestions.size < 8) {
      const remainingSkills = allSkillsData
          .filter(skill => !existingSkills.includes(skill.name) && !suggestions.has(skill.name))
          .map(skill => skill.name);
      
      // Shuffle and take remaining to fill up to 8
      for (let i = 0; i < remainingSkills.length && suggestions.size < 8; i++) {
          suggestions.add(remainingSkills[i]);
      }
  }

  return Array.from(suggestions);
};

const ExpertiseEditor: React.FC<ExpertiseEditorProps> = ({ currentExpertise, onSave, onCancel, userDepartment }) => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [initialSuggestions, setInitialSuggestions] = useState<string[]>([]); // for initial bubbles
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSelectedSkills(currentExpertise);
  }, [currentExpertise]);

  // Effect to populate initial suggestions when component mounts or userDepartment/currentExpertise changes
  useEffect(() => {
    // Only re-calculate if input is empty, otherwise live suggestions take over
    if (inputValue.length === 0) { 
        const suggestions = getInitialSkillSuggestions(userDepartment, selectedSkills, SAAS_SKILLS_DATA); // Use selectedSkills here
        setInitialSuggestions(suggestions);
    }
  }, [userDepartment, selectedSkills, inputValue]); // Added selectedSkills and inputValue to dependencies

  // Effect to filter live suggestions based on input and department
  useEffect(() => {
    if (inputValue.length > 1) {
      let suggestions = SAAS_SKILLS_DATA;

      if (userDepartment) {
        const normalizedUserDepartment = userDepartment.toLowerCase();
        suggestions = suggestions.filter(skill => 
          skill.categories.some(cat => 
            cat.toLowerCase().includes(normalizedUserDepartment) || 
            normalizedUserDepartment.includes(cat.toLowerCase())
          )
        );
      }
      
      const filtered = suggestions
        .filter(skill =>
          skill.name.toLowerCase().includes(inputValue.toLowerCase()) && 
          !selectedSkills.includes(skill.name)
        )
        .map(skill => skill.name)
        .slice(0, 10);

      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [inputValue, selectedSkills, userDepartment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const addSkill = (skill: string) => {
    const normalizedSkill = skill.trim();
    if (normalizedSkill && !selectedSkills.includes(normalizedSkill)) {
      setSelectedSkills(prev => [...prev, normalizedSkill]);
      setInputValue(''); // Clear input after adding
      setFilteredSuggestions([]); // Clear live suggestions
      // REMOVED: setInitialSuggestions([]); // DO NOT clear initial suggestions here
      inputRef.current?.focus();
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(prev => prev.filter(skill => skill !== skillToRemove));
    // The initialSuggestions useEffect will re-evaluate based on updated selectedSkills
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && selectedSkills.length > 0) {
      e.preventDefault();
      setSelectedSkills(prev => prev.slice(0, prev.length - 1));
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-md p-3 bg-gray-50 dark:bg-gray-700">
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] items-center">
        {selectedSkills.length === 0 && (inputValue === '' && filteredSuggestions.length === 0 && initialSuggestions.length === 0) && (
          <span className="text-gray-500 italic dark:text-gray-400">No expertise added yet.</span>
        )}
        {selectedSkills.map((skill, index) => (
          <span
            key={index}
            className="flex items-center bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full dark:bg-purple-900 dark:text-purple-200"
          >
            {skill}
            <button
              onClick={() => removeSkill(skill)}
              className="ml-2 text-purple-600 dark:text-purple-300 hover:text-purple-900 dark:hover:text-purple-100 focus:outline-none"
              title={`Remove ${skill}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Type to add or search expertise..."
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100"
        />
        {/* Conditional rendering for suggestions: live filtered OR initial bubbles */}
        {(inputValue.length > 1 && filteredSuggestions.length > 0) ? (
          // Live filtered suggestions (dropdown)
          <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
            {filteredSuggestions.map((skill, index) => (
              <li
                key={index}
                onClick={() => addSkill(skill)}
                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
              >
                {skill}
              </li>
            ))}
          </ul>
        ) : (inputValue.length === 0 && initialSuggestions.length > 0) ? ( // Only show if input is empty AND there are initial suggestions
          // Initial clickable bubbles
          <div className="flex flex-wrap gap-2 mt-3 p-1">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 mr-1">Suggestions:</span>
            {initialSuggestions.map((skill, index) => (
              <button
                key={index}
                onClick={() => addSkill(skill)}
                className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors duration-200"
              >
                {skill}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      
      <div className="flex justify-end gap-2 mt-3">
        <button
          onClick={() => onSave(selectedSkills)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Save Expertise
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ExpertiseEditor;