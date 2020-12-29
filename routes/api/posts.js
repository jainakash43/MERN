const express = require('express');
const router = express.Router();
const  {check, validationResult} = require('express-validator');
const  auth =  require('../../middleware/auth');
const Post = require('../../models/Posts');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Posts = require('../../models/Posts');

//Post api/post
//access private
router.post('/',
             [
                 auth,
                 [
                     check('text','Text is required').not().isEmpty(),
                 ]
             ],
             async (req,res) => {

                 try {
                 const errors = validationResult(req);
                 if(!errors.isEmpty())
                 {
                     return res.status(400).json({errors : errors.array()});
                 }

                 const user = await User.findById(req.user.id).select("-password");
                 const newPost = new Post({
                     text: req.body.text,
                     name:user.name,
                     avatar:user.avatar,
                     user:req.user.id
                 });
                 
                 const post = await newPost.save();

                 res.json(post);
                }
                catch(err)
                {
                    console.error(err.message);
                    res.status(500).send("Server Error");
                }
            });

    // @route GET api/posts
    // @desc get all posts
    // private access

    router.get('/', auth,  async(req,res) =>{

            try
            {
                const posts = await Post.find().sort({date:-1});
                res.json(posts);
            }
            catch(err)
            {
                console.error(err.message);
                res.status(500).send('Server Error');
            }
    });
   
   //@route Get api/post/:postID
   //@desc get post by id
   //private access

   router.get('/:id',auth, async(req,res) =>{
         
          try
          {
              const post = await Post.findById(req.params.id);

              if(!post)
              {
                   return res.status(404).json({msg:'Post not found'});
              }

              res.json(post);
          }
          catch(err)
          {
              console.err(err.message);
              if( err.kind === 'ObjectId')
              {
                  return res.status(400).json({msg: 'Post not found'});
              }
              res.status(500).send('Server Error');
          }
   });

   //@route delete api/post/:postID
   //private access

   router.delete('/:id', auth, async(req,res) =>{
            
           try
           {
               const post = await Post.findById(req.params.id);
               
               if(!post)
               {
                   return res.status(401).json({msg:'Post not found'});
               }
               if(post.user.toString() !== req.user.id)
                {
                    return res.status(401).json({msg:'User not authorized'});
                }

               await post.remove();

               res.json({msg:'Post removed'});
           }
           catch(err)
           {
               console.error(err.message);
               if(err.kind==='ObjectId')
               {
                   return res.status(404).json({msg:'Post not found'});
               }
               return res.status(500).send('Server Error');
           }

   })
    // like a post
    router.put('/like/:id',auth, async (req,res) =>{

            try
            {
               const post = await Post.findById(req.params.id);
               
               //check if post has already liked
               if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0 )
                  {
                      res.status(400).json({'msg':"post already liked"});
                  }

                post.likes.unshift({user:req.user.id});

                await post.save();

                res.json(post.likes);

            }
            catch(err)
            {
                console.error(err.message);
                res.status(500).send("Server Error");
            }

    });
    
    //unlike a post
    //private access
    router.put('/unlike/:id',auth, async (req,res) =>{
        
         try
         {
          const post = await Post.findById(req.params.id);

          //check if the post already liked
          if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0)
          {
              return res.status(400).json({msg :"post has not liked yet"});
          }

          const removeIndex =  post.likes.map( like => like.user.toString()).indexOf(req.user.id);

          post.likes.splice(removeIndex,1);

          await post.save();

          res.json(post.likes);
        }
        catch(err)
        {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

    });
     
    // @route api/posts/comment/:id
    // comment on post
    // private access
    router.post('/comment/:id',
             [
                 auth,
                 [
                     check('text','Text is required').not().isEmpty(),
                 ]
             ],
             async (req,res) => {

                 try {
                 const errors = validationResult(req);
                 if(!errors.isEmpty())
                 {
                     return res.status(400).json({errors : errors.array()});
                 }

                 const user = await User.findById(req.user.id).select("-password");
                 const post = await Post.findById(req.params.id);

                 const newComment = {
                     text: req.body.text,
                     name:user.name,
                     avatar:user.avatar,
                     user:req.user.id
                 };

                 post.comments.unshift(newComment);
                 await post.save();

                 res.json(post.comments);
                }
                catch(err)
                {
                    console.error(err.message);
                    res.status(500).send("Server Error");
                }
            });
    
    //@route /api/posts/comment/:id/:comment_id
    // delete comment
    router.delete('/comment/:id/:comment_id', auth, async (req,res) => {
     
        try {
            
             const post = await  Posts.findById(req.params.id);

             //pull out comment
             const comment = post.comments.find(comment => comment.id === req.params.comment_id);

             if(!comment)
             {
                  res.status(404).json({msg:"comment not found"});
             }

             if(comment.user.toString() !== req.user.id)
             {
                 res.status(401).json({msg:"user not authorized"});
             }

             //get remove index
             
          const removeIndex =  post.comments.map( comment => comment.user.toString()).indexOf(req.user.id);

          post.comments.splice(removeIndex,1);

          await post.save();

          res.json(post.comments);        
        } 
        catch (error) {
            
            console.error(error.message);
            res.status(500).send("Server Error");

        }
    });







module.exports=router;