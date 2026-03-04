const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  surveyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'surveys',
      key: 'id'
    }
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('multiple', 'text', 'rating'),
    allowNull: false
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'questions',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

const Survey = sequelize.define('Survey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PUBLISHED', 'CLOSED'),
    defaultValue: 'PUBLISHED',
    allowNull: false
  },
  responseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  targetAudience: {
    type: DataTypes.JSON,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'surveys',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

// Associations
Survey.hasMany(Question, { foreignKey: 'surveyId', as: 'questions' });
Question.belongsTo(Survey, { foreignKey: 'surveyId', as: 'survey' });

// Instance method to increment response count
Survey.prototype.incrementResponseCount = async function() {
  this.responseCount += 1;
  await this.save();
};

module.exports = { Survey, Question };
