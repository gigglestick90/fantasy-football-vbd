# Fantasy Football VBD Draft Assistant

A sophisticated Value Based Drafting (VBD) tool for fantasy football that provides AI-powered recommendations, real-time analysis, and strategic insights to dominate your draft.

## 🏈 Features

### Smart Draft Recommendations
- **AI-powered player recommendations** that balance VBD scores with team needs
- **7 Draft Strategies** to match your style:
  - Balanced - Mix of value and needs
  - QB Heavy - Prioritize QBs for superflex advantage
  - Hero RB - Target one elite RB early
  - Zero RB - Wait on RBs, load up elsewhere
  - Hero WR - Target one elite WR early
  - Zero WR - Wait on WRs, focus on RB/TE
  - VBD Only - Pure value-based approach

### Real-Time Analysis
- **Live VBD calculations** that update as players are drafted
- **Team needs assessment** showing position requirements and depth
- **VBD grading system** to evaluate your draft performance
- **Position scarcity tracking** to identify tier drops

### Interactive Visualizations
- **Radar chart** showing positional strength
- **Bar charts** displaying top players by VBD
- **Color-coded draft board** with snake draft support
- **Visual indicators** for recommended players

### User Experience
- **Clean, modern interface** with dark theme
- **Atkinson Hyperlegible font** for enhanced readability
- **Mobile-responsive design**
- **Performance optimized** with code splitting

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/gigglestick90/fantasy-football-vbd.git
cd fantasy-football-vbd
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📊 Data Source

The app uses 2024 NFL season statistics to project 2025 player performance. Data is loaded from `src/data/2024_FF_Stats.csv`.

## 🎯 How It Works

### VBD Calculation
Value Based Drafting (VBD) compares each player's projected points to a baseline player at their position:
- QB: QB12 (worst starter in 12-team league)
- RB: RB24 (2 starters × 12 teams)
- WR: WR36 (3 starters × 12 teams)
- TE: TE12 (1 starter × 12 teams)

### Recommendation Engine
The AI considers multiple factors:
1. **VBD Score** - Higher value players score better
2. **Team Needs** - Critical positions get priority
3. **Position Scarcity** - Bonus when quality drops off
4. **Strategy Alignment** - Adjusts based on selected approach

## 🏆 Scoring Settings

### Passing
- Passing Yards: 0.04 points/yard (1 point per 25 yards)
- Passing TD: 4 points
- Interception: -2 points
- 300-399 Yard Bonus: 1.5 points
- 400+ Yard Bonus: 3 points

### Rushing
- Rushing Yards: 0.1 points/yard (1 point per 10 yards)
- Rushing TD: 6 points
- 100-199 Yard Bonus: 2.5 points
- 200+ Yard Bonus: 5 points

### Receiving
- Reception: 0.5 points (PPR)
- WR Reception Bonus: +0.5 points (1.0 total)
- TE Reception Bonus: +1.0 points (1.5 total)
- Receiving Yards: 0.1 points/yard
- Receiving TD: 6 points
- 100-199 Yard Bonus: 2 points
- 200+ Yard Bonus: 4 points

## 🛠️ Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Recharts** - Data visualization
- **Lucide React** - Icons

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Font: [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) by Braille Institute
- Data source: 2024 NFL season statistics

---

Made with ❤️ for fantasy football enthusiasts
