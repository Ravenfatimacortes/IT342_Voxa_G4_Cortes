const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Answer = sequelize.define('Answer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  responseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'responses',
      key: 'id'
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'questions',
      key: 'id'
    }
  },
  answerText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  answerOptions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 5
    }
  }
}, {
  tableName: 'answers',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci'
});

const Response = sequelize.define('Response', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  completionTime: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'responses',
  timestamps: true,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_ci',
  indexes: [
    {
      unique: true,
      fields: ['surveyId', 'userId']
    }
  ]
});

// Associations
Response.hasMany(Answer, { foreignKey: 'responseId', as: 'answers' });
Answer.belongsTo(Response, { foreignKey: 'responseId', as: 'response' });

// Import Question model to avoid circular dependency
const QuestionModel = sequelize.models.Question;
if (QuestionModel) {
  Answer.belongsTo(QuestionModel, { foreignKey: 'questionId', as: 'question' });
}

module.exports = { Response, Answer };
