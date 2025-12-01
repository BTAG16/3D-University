import React, { useState } from 'react';
import { motion } from 'framer-motion';

const BuildingBlock = ({ 
  width, 
  height, 
  depth, 
  x, 
  y, 
  color = "#667eea", 
  delay = 0,
  label
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="transform-style-3d cursor-pointer group"
      style={{
        position: 'absolute',
        width: width,
        height: depth,
        left: x,
        top: y,
        transform: `translateZ(0px)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ 
        translateZ: 20,
        transition: { duration: 0.2 }
      }}
    >
      {/* Top Face */}
      <div 
        style={{ 
          position: 'absolute',
          width: '100%',
          height: '100%',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          background: hovered ? '#32b8c6' : color,
          opacity: 0.9,
          transform: `translateZ(${height}px)`,
          boxShadow: hovered ? '0 0 20px rgba(50, 184, 198, 0.6)' : 'none'
        }}
      >
        {label && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '-3rem', 
              left: '50%', 
              transform: hovered ? 'translate(-50%, 0)' : 'translate(-50%, -10px)',
              backgroundColor: 'white', 
              color: 'black', 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem', 
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s, transform 0.2s',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            {label}
          </div>
        )}
      </div>
      
      {/* Front Face */}
      <div 
        style={{ 
          position: 'absolute',
          width: '100%',
          height: height,
          transformOrigin: 'bottom',
          background: hovered ? '#289ba8' : '#556cd6', // Darker shade manually approximated
          transform: `rotateX(-90deg) translateZ(${depth}px)`,
          bottom: 0
        }}
      />
      
      {/* Right Face */}
      <div 
        style={{ 
          position: 'absolute',
          height: '100%',
          width: height,
          transformOrigin: 'left',
          background: hovered ? '#208590' : '#4a5ebf', // Even darker shade
          transform: `rotateY(90deg) translateX(${width}px)`,
          right: 0
        }}
      />
    </motion.div>
  );
};

export const InteractiveMap = () => {
  return (
    <div className="map-container">
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')",
          opacity: 0.1
        }}
      ></div>
      
      {/* Map Container */}
      <div className="perspective-1000" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          className="transform-style-3d"
          style={{ 
            position: 'relative',
            width: '600px',
            height: '600px',
            background: 'rgba(31, 41, 55, 0.5)', // gray-800/50
            border: '4px solid rgba(55, 65, 81, 0.5)', // gray-700/50
            borderRadius: '0.75rem',
            transform: 'rotateX(60deg) rotateZ(-45deg)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
          animate={{
            rotateZ: [-45, -40, -45],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          {/* Grid Lines */}
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(6, 1fr)', pointerEvents: 'none' }}>
            {[...Array(36)].map((_, i) => (
              <div key={i} style={{ border: '1px solid rgba(255, 255, 255, 0.05)' }}></div>
            ))}
          </div>

          {/* Buildings */}
          <BuildingBlock width={80} depth={80} height={120} x={100} y={100} color="#667eea" delay={0.1} label="Science Center" />
          <BuildingBlock width={60} depth={140} height={80} x={220} y={150} color="#764ba2" delay={0.2} label="Library" />
          <BuildingBlock width={100} depth={60} height={160} x={350} y={200} color="#32b8c6" delay={0.3} label="Engineering Hall" />
          <BuildingBlock width={50} depth={50} height={40} x={150} y={350} color="#f59e0b" delay={0.4} label="Coffee Shop" />
          <BuildingBlock width={120} depth={80} height={100} x={300} y={400} color="#ef4444" delay={0.5} label="Sports Complex" />
          
          {/* Paths/Roads */}
          <div style={{ position: 'absolute', top: '200px', left: 0, width: '100%', height: '20px', background: 'rgba(75, 85, 99, 0.3)', transform: 'translateZ(1px)' }} />
          <div style={{ position: 'absolute', top: 0, left: '250px', width: '20px', height: '100%', background: 'rgba(75, 85, 99, 0.3)', transform: 'translateZ(1px)' }} />

          {/* Floating Markers */}
          <motion.div 
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '16px',
              height: '16px',
              background: 'white',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(255,255,255,0.8)',
              transform: 'translateZ(200px)'
            }}
            animate={{ z: [180, 220, 180] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div style={{ 
              position: 'absolute', 
              top: '-2rem', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              background: 'white', 
              color: 'black', 
              fontSize: '0.75rem', 
              fontWeight: 'bold', 
              padding: '0.25rem 0.5rem', 
              borderRadius: '0.25rem' 
            }}>
              You
            </div>
          </motion.div>

        </motion.div>
      </div>
      
      {/* Overlay UI */}
      <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', pointerEvents: 'none' }}>
        <div className="glass-card" style={{ padding: '1rem', borderRadius: '0.75rem', pointerEvents: 'auto' }}>
          <h3 style={{ color: 'white', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Interactive Campus</h3>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem' }}>Drag and hover to explore</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
          <button style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer' }}>+</button>
          <button style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none', cursor: 'pointer' }}>-</button>
        </div>
      </div>
    </div>
  );
};