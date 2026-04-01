import pdfMake from 'pdfmake/build/pdfmake'
import vfs from 'pdfmake/build/vfs_fonts'

// Register fonts
pdfMake.vfs = vfs
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
}

interface FitnessProgram {
  id: string
  workoutPlan: any
  dietPlan: any
  generatedAt: string
  createdAt: string
}

export const generatePDF = async (
  program: FitnessProgram,
  userInfo: { firstName: string; lastName: string; email: string },
) => {
  try {
    const docDefinition = createDocumentDefinition(program, userInfo)

    // Create and download the PDF
    const pdfDocGenerator = pdfMake.createPdf(docDefinition)
    const fileName = `MaxFitAI_Plan_${new Date(program.createdAt)
      .toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-')}.pdf`

    pdfDocGenerator.download(fileName)
    return true
  } catch (error) {
    console.error('Error generating PDF:', error)
    return false
  }
}
const createDocumentDefinition = (
  program: FitnessProgram,
  userInfo: { firstName: string; lastName: string; email: string },
) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getSetsValue = (sets: number | { $numberInt: string } | undefined): number => {
    if (typeof sets === 'number') return sets
    if (sets && typeof sets === 'object' && '$numberInt' in sets) {
      return parseInt(sets.$numberInt)
    }
    return 0
  }

  const getCaloriesValue = (calories: number | { $numberInt: string }): number => {
    if (typeof calories === 'number') return calories
    if (calories && typeof calories === 'object' && '$numberInt' in calories) {
      return parseInt(calories.$numberInt)
    }
    return 0
  }

  const content: any[] = []

  // Header
  content.push(
    {
      text: 'MAXFIT AI',
      style: 'headerTitle',
      alignment: 'center',
      margin: [0, 0, 0, 10]
    },
    {
      text: 'Personalized Fitness Plan',
      style: 'headerSubtitle',
      alignment: 'center',
      margin: [0, 0, 0, 20]
    },
    {
      text: [
        { text: 'Generated for: ', bold: true },
        `${userInfo.firstName} ${userInfo.lastName}\n`,
        { text: 'Email: ', bold: true },
        `${userInfo.email}\n`,
        { text: 'Generated on: ', bold: true },
        formatDate(program.createdAt)
      ],
      style: 'headerInfo',
      alignment: 'center',
      margin: [0, 0, 0, 30]
    }
  )

  // Workout Plan Section
  if (program.workoutPlan) {
    content.push(
      {
        text: 'Workout Plan',
        style: 'sectionTitle',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Program Overview',
        style: 'subsectionTitle',
        margin: [0, 0, 0, 10]
      },
      {
        text: program.workoutPlan.overview,
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      }
    )

    // Program stats
    const statsTable = {
      table: {
        widths: ['*', '*', '*'],
        body: [
          [
            { text: program.workoutPlan.duration, style: 'statValue', alignment: 'center' },
            { text: program.workoutPlan.frequency, style: 'statValue', alignment: 'center' },
            { text: (program.workoutPlan.weeklySchedule?.length || 0).toString(), style: 'statValue', alignment: 'center' }
          ],
          [
            { text: 'Duration', style: 'statLabel', alignment: 'center' },
            { text: 'Frequency', style: 'statLabel', alignment: 'center' },
            { text: 'Workout Days', style: 'statLabel', alignment: 'center' }
          ]
        ]
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20]
    }
    content.push(statsTable)

    // Weekly Schedule
    if (program.workoutPlan.weeklySchedule) {
      program.workoutPlan.weeklySchedule.forEach((day: any, index: number) => {
        content.push({
          text: `${index + 1}. ${day.day} - ${day.workoutType}`,
          style: 'dayTitle',
          margin: [0, 15, 0, 10]
        })

        if (day.exercises) {
          day.exercises.forEach((exercise: any) => {
            const exerciseContent: any[] = [
              { text: exercise.name, style: 'exerciseName', margin: [20, 0, 0, 8] } // Added left margin for subheading appearance
            ]

            // Exercise details
            const details = []
            if (exercise.sets) {
              details.push({ text: `• Sets: ${getSetsValue(exercise.sets)}`, style: 'exerciseDetail' })
            }
            details.push({ text: `• Reps: ${exercise.reps}`, style: 'exerciseDetail' })
            if (exercise.weight) {
              details.push({ text: `• Weight: ${exercise.weight}`, style: 'exerciseDetail' })
            }
            if (exercise.restTime) {
              details.push({ text: `• Rest: ${exercise.restTime}`, style: 'exerciseDetail' })
            }

            exerciseContent.push({
              stack: details.map(detail => ({
                text: detail.text,
                style: detail.style,
                margin: [0, 2, 0, 2]
              })),
              margin: [20, 0, 0, 8] // Added left margin to align with exercise name subheading
            })

            if (exercise.notes) {
              exerciseContent.push({
                text: `${exercise.notes}`,
                style: 'exerciseNote',
                margin: [20, 5, 0, 10] // Added left margin to align with exercise name subheading
              })
            }

            content.push({
              stack: exerciseContent,
              style: 'exerciseBox',
              margin: [0, 0, 0, 12]
            })
          })
        }
      })
    }

    // Progression Notes & Safety Tips
    if (program.workoutPlan.progressionNotes || program.workoutPlan.safetyTips) {
      content.push({
        stack: [
          program.workoutPlan.progressionNotes ? {
            stack: [
              { text: 'Progression Notes', style: 'subsectionTitle', margin: [0, 0, 0, 8] },
              { text: program.workoutPlan.progressionNotes, style: 'bodyText', alignment: 'justify' }
            ],
            margin: [0, 0, 0, 15]
          } : null,
          program.workoutPlan.safetyTips ? {
            stack: [
              { text: 'Safety Tips', style: 'subsectionTitle', margin: [0, 0, 0, 8] },
              {
                ul: program.workoutPlan.safetyTips.slice(0, 4).map((tip: string) => ({ text: tip, style: 'bodyText', alignment: 'justify' })),
                margin: [15, 0, 0, 0]
              }
            ]
          } : null
        ].filter(Boolean),
        margin: [0, 20, 0, 0]
      })
    }
  }

  if (program.dietPlan) {
    content.push(
      {
        text: 'Nutrition Plan',
        style: 'sectionTitle',
        alignment: 'justify',
        margin: [0, 30, 0, 20],
        pageBreak: 'before'
      },
      {
        text: 'Nutrition Overview',
        style: 'subsectionTitle',
        margin: [0, 0, 0, 10]
      },
      {
        text: program.dietPlan.overview,
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      }
    )

    if (program.dietPlan.calorieTarget || program.dietPlan.macroBreakdown) {
      const nutritionStats = {
        table: {
          widths: program.dietPlan.macroBreakdown ? ['*', '*', '*', '*'] : ['*'],
          body: [
            [
              program.dietPlan.calorieTarget ? { text: program.dietPlan.calorieTarget.toString(), style: 'statValue', alignment: 'center' } : '',
              program.dietPlan.macroBreakdown?.protein ? { text: program.dietPlan.macroBreakdown.protein.toString(), style: 'statValue', alignment: 'center' } : '',
              program.dietPlan.macroBreakdown?.carbohydrates ? { text: program.dietPlan.macroBreakdown.carbohydrates.toString(), style: 'statValue', alignment: 'center' } : '',
              program.dietPlan.macroBreakdown?.fats ? { text: program.dietPlan.macroBreakdown.fats.toString(), style: 'statValue', alignment: 'center' } : ''
            ].filter(Boolean),
            [
              program.dietPlan.calorieTarget ? { text: 'Calories', style: 'statLabel', alignment: 'center' } : '',
              program.dietPlan.macroBreakdown?.protein ? { text: 'Protein', style: 'statLabel', alignment: 'center' } : '',
              program.dietPlan.macroBreakdown?.carbohydrates ? { text: 'Carbs', style: 'statLabel', alignment: 'center' } : '',
              program.dietPlan.macroBreakdown?.fats ? { text: 'Fats', style: 'statLabel', alignment: 'center' } : ''
            ].filter(Boolean)
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      }
      content.push(nutritionStats)
    }

    // Daily Meal Plan
    content.push({
      text: 'Daily Meal Plan',
      style: 'subsectionTitle',
      margin: [0, 0, 0, 15]
    })

    if (program.dietPlan.mealPlan) {
      ['breakfast', 'lunch', 'dinner'].forEach((mealType, index) => {
        const meal = program.dietPlan.mealPlan[mealType]
        if (meal) {
          content.push({
            stack: [
              { text: `${index + 1}. ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`, style: 'mealTitle', margin: [0, 0, 0, 8] },
              { text: meal.meal, style: 'bodyText', margin: [0, 0, 0, 10] },
              {
                text: [
                  meal.calories ? { text: `${getCaloriesValue(meal.calories)} cal | `, style: 'macroValue', alignment: 'center' } : null,
                  meal.protein ? { text: `${meal.protein}g protein | `, style: 'macroValue', alignment: 'center' } : null,
                  meal.carbs ? { text: `${meal.carbs}g carbs | `, style: 'macroValue', alignment: 'center' } : null,
                  meal.fats ? { text: `${meal.fats}g fats`, style: 'macroValue', alignment: 'center' } : null
                ].filter(Boolean),
                margin: [0, 0, 0, 10]
              }
            ],
            style: 'mealBox',
            margin: [0, 0, 0, 15]
          })
        }
      })
    }

    if (program.dietPlan.hydrationGoal || program.dietPlan.supplementRecommendations) {
      content.push({
        stack: [
          program.dietPlan.hydrationGoal ? {
            stack: [
              { text: 'Hydration Guidelines', style: 'subsectionTitle', margin: [0, 0, 0, 8] },
              { text: program.dietPlan.hydrationGoal, style: 'bodyText' }
            ],
            margin: [0, 0, 0, 15]
          } : null,
          program.dietPlan.supplementRecommendations ? {
            stack: [
              { text: 'Supplement Recommendations', style: 'subsectionTitle', margin: [0, 0, 0, 8] },
              {
                ul: program.dietPlan.supplementRecommendations.slice(0, 5).map((supplement: string) => ({ text: supplement, style: 'bodyText' })),
                margin: [15, 0, 0, 0]
              }
            ]
          } : null
        ].filter(Boolean),
        margin: [0, 20, 0, 0]
      })
    }
  }

  return {
    content,
    styles: {
      headerTitle: {
        fontSize: 28,
        bold: true,
        color: '#000000',
        margin: [0, 0, 0, 8] as [number, number, number, number]
      },
      headerSubtitle: {
        fontSize: 18,
        bold: true,
        color: '#333333'
      },
      headerInfo: {
        fontSize: 10,
        color: '#666666',
        lineHeight: 1.4
      },
      sectionTitle: {
        fontSize: 18,
        bold: true,
        color: '#333333',
        margin: [0, 15, 0, 10] as [number, number, number, number]
      },
      subsectionTitle: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      dayTitle: {
        fontSize: 14,
        bold: true,
        color: '#000000',
        padding: [10, 10, 10, 10]
      },
      exerciseName: {
        fontSize: 12,
        bold: true,
        color: '#333333'
      },
      exerciseDetail: {
        fontSize: 9,
        color: '#666666',
        padding: [6, 8, 6, 8],
        margin: [0, 2, 0, 2] as [number, number, number, number]
      },
      exerciseNote: {
        fontSize: 9,
        color: '#856404',
        italics: true,
        background: '#f8f9fa',
        padding: [8, 8, 8, 8],
        borderLeft: [2, '#ffc107']
      },
      exerciseBox: {
        background: '#ffffff',
        padding: [12, 12, 12, 12],
        borderLeft: [3, '#000000'],
        margin: [0, 0, 8, 0] as [number, number, number, number]
      },
      mealTitle: {
        fontSize: 14,
        bold: true,
        color: '#333333'
      },
      mealBox: {
        padding: [15, 15, 15, 15],
        margin: [0, 0, 12, 0] as [number, number, number, number]
      },
      macroValue: {
        fontSize: 12,
        bold: true,
        color: '#000000'
      },
      macroLabel: {
        fontSize: 9,
        color: '#000000'
      },
      statValue: {
        fontSize: 13,
        bold: true,
        color: '#000000'
      },
      statLabel: {
        fontSize: 10,
        color: '#000000'
      },
      bodyText: {
        fontSize: 10,
        color: '#555555',
        lineHeight: 1.4
      }
    },
    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'right',
      fontSize: 8,
      color: '#999999',
      margin: [0, 10, 20, 0]
    } as any),
    pageMargins: [30, 40, 40, 40] as [number, number, number, number], // left, top, right, bottom - increased top/bottom margins
    defaultStyle: {
      font: 'Roboto'
    }
  }
}