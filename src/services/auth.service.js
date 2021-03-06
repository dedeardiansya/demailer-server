import httpStatus from 'http-status'
import userService from './user.service'
import tokenService from './token.service'
import ApiError from '../utils/ApiError'
import { Token } from '../models/index'
import { tokenTypes } from '../config/tokens'

const loginUserWithEmailAndPassword = async (email, password) => {
  const user = await userService.getUserByEmail(email)
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password')
  }
  return user
}

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({ token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false })
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found')
  }
  await refreshTokenDoc.remove()
}

const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH)
    const user = await userService.getUserById(refreshTokenDoc.user)
    if (!user) {
      throw new Error()
    }
    await refreshTokenDoc.remove()
    return tokenService.generateAuthTokens(user)
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate')
  }
}

const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(resetPasswordToken, tokenTypes.RESET_PASSWORD)
    const user = await userService.getUserById(resetPasswordTokenDoc.user)
    if (!user) {
      throw new Error()
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD })
    await userService.updateUserById(user.id, { password: newPassword })
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed')
  }
}

const updateEmail = async (updateEmailToken, newEmail) => {
  try {
    const updateEmailTokenDoc = await tokenService.verifyToken(updateEmailToken, tokenTypes.UPDATE_EMAIL)
    const user = await userService.getUserById(updateEmailTokenDoc.user)
    if (!user) {
      throw new Error()
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.UPDATE_EMAIL })
    await userService.updateUserById(user.id, { email: newEmail })
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Update email failed failed')
  }
}

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  updateEmail,
}
