import { createContext, useReducer } from 'react'
import React from 'react'
import firebase from 'firebase/app'
import { useAuth } from './authContext'

export const BuilderContext = createContext()

const initialState = {
  blocks: [],
  id: ''
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'PUSH_BLOCK':
      return { ...state, blocks: [...state.blocks, action.payload] }
    case 'DELETE_BLOCK':
      const tempData = [...state.blocks]
      tempData.splice(action.payload, 1)
      return { ...state, blocks: tempData }
    case 'PUSH_FORM':
      return { ...state, id: action.payload }
    default:
      return state
  }
}

const BuilderProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const { user } = useAuth()
  const { blocks, id } = state

  const pushBlock = data => {
    dispatch({
      type: 'PUSH_BLOCK',
      payload: { ...data }
    })
  }

  const deleteBlock = index => {
    dispatch({ type: 'DELETE_BLOCK', payload: index })
  }

  const pushForm = async form => {
    const collection = item => firebase.firestore().collection(item)
    const formsCollection = collection('users')
      .doc(user.uid)
      .collection('forms')
      .doc()
    const formId = formsCollection.id
    dispatch({ type: 'PUSH_FORM', payload: formId })
    if (blocks.length > 0) {
      await formsCollection
        .set({
          _id: formId,
          form,
          created_at: new Date()
        })
        .then()
        .catch(error => {
          alert(error.message)
        })
    }
  }

  return (
    <BuilderContext.Provider
      value={{ pushBlock, deleteBlock, pushForm, blocks, id }}
    >
      {children}
    </BuilderContext.Provider>
  )
}

export default BuilderProvider
