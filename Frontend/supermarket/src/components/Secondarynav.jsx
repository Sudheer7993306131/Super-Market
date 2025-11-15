import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Secondarynav.css";

const Secondarynav = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const hideTimeout = useRef(null);

  // ✅ Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("https://super-market-back.onrender.com/api/categories/");
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch subcategories when hovering a category
  const handleHover = (categoryName) => {
    // Cancel hide delay if moving between categories quickly
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setHoveredCategory(categoryName);

    // Fetch subcategories only once per category
    if (!subcategories[categoryName]) {
      fetch(`https://super-market-back.onrender.com/api/categories/${categoryName}/subcategories/`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load subcategories");
          return res.json();
        })
        .then((data) => {
          setSubcategories((prev) => ({
            ...prev,
            [categoryName]: data,
          }));
        })
        .catch((err) => console.error("Error fetching subcategories:", err));
    }
  };

  // ✅ Small delay before hiding dropdown (for smoother UI)
  const handleMouseLeave = () => {
    hideTimeout.current = setTimeout(() => {
      setHoveredCategory(null);
    }, 150);
  };

  // ✅ Navigate to products page when subcategory clicked
  const handleNavigate = (subcategoryName) => {
    const encodedName = encodeURIComponent(subcategoryName);  
    navigate(`/products/subcategory/${encodedName}`);
  };

  return (
    <nav className="navbar">
      {/* 🟩 Main Categories */}
      <ul className="nav-list">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className={`nav-item ${hoveredCategory === cat.name ? "active" : ""}`}
            onMouseEnter={() => handleHover(cat.name)}
            onMouseLeave={handleMouseLeave}
          >
            {cat.name}
          </li>
        ))}
      </ul>

      {/* 🟨 Subcategories dropdown strip */}
      {hoveredCategory && subcategories[hoveredCategory] && (
        <div
          className="subcategory-strip"
          onMouseEnter={() => handleHover(hoveredCategory)} // Keeps open while hovering
          onMouseLeave={handleMouseLeave}
        >
          {subcategories[hoveredCategory].length > 0 ? (
            subcategories[hoveredCategory].map((sub) => (
              <div
                key={sub.id}
                className="subcategory-item"
                onClick={() => handleNavigate(sub.name)}
              >
                {/* <img
                  src={sub.image || "/images/default.jpg"}
                  alt={sub.name}
                  onError={(e) => (e.target.src = "/images/default.jpg")}
                /> */}
                <p>{sub.name}</p>
              </div>
            ))
          ) : (
            <p style={{ color: "#555", fontSize: "14px" }}>No subcategories available</p>
          )}
        </div>
      )}
    </nav>
  );
};

export default Secondarynav;
