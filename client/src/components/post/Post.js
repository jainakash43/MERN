import React , { Fragment, useEffect} from 'react';
import PropTypes from 'prop-types';
import {connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getPost } from '../../actions/post';
import PostItem from '../posts/PostItem';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { Link } from 'react-router-dom';

const Post = ({ getPost , post:{ post, loading}, match }) => {
    console.log(post);
    useEffect(() =>{
        getPost(match.params.id);
    },[getPost]);
   
   
   
   return post!=null ? (<Fragment> 
   <Link to='/posts' className='btn'>
       Back To Posts
   </Link>
   <PostItem post = {post}  showActions = {false} /> 
   <CommentForm  postId={post._id} />
   <div className="comments">
      {post.comments.map( comment =>(
          <CommentItem  key={comment._id} comment = {comment} postId={post._id} />
      ))}
   </div>
   </Fragment>) : <Spinner/>
   
};

Post.propTypes = {
    getPost:PropTypes.func.isRequired,
    post:PropTypes.object.isRequired
};
const mapStatesToProps=state=>({
    post: state.post
});
export default connect(mapStatesToProps,{getPost})(Post);