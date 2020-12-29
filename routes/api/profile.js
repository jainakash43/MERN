const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile =  require('../../models/Profile');
const User = require('../../models/User');
const  {check, validationResult} = require('express-validator');
const { route } = require('./auth');
const request = require('request');
const config = require('config');
const Post = require('../../models/Posts');
// @route Get api/profile/me
// @desc   get current user profile
// @access private


router.get('/me' ,auth, async(req,res) =>{
  
    
     
     try 
     {
         const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
        
         if(!profile)
         {
              return res.status(400).json({msg:"There is no profile for this user"});

         }
         res.json(profile);
           
     }
     catch(err)
     {
         console.error(err.message);
         res.status(500).send('Server Error');
     }

});

// create a new profile or update the existing one
router.post('/',
            [auth,[check('status','Status is required').not().isEmpty(),
                   check('skills','Skill are required').not().isEmpty()
            ]],
            async(req,res) => {
              
              const errors = validationResult(req);
              if(!errors.isEmpty())
              {
                  return res.status(400).json({error: errors.array()})
              }
              
              const {
                    company,
                    website,
                    location,
                    bio,
                    status,
                    githubusername,
                    skills,
                    youtube,
                    facebook,
                    twiiter,
                    instagram,
                    linkedin
              } = req.body;

            const profileFields = {};
            profileFields.user=req.user.id;

            if(company) profileFields.company = company;
            if(website) profileFields.website = website;
            if(location) profileFields.location = location;
            if(bio) profileFields.bio = bio;
            if(status) profileFields.status = status;
            if(githubusername) profileFields.company = githubusername;
            
            if(skills){
                profileFields.skills = skills.split(',').map(skill => skill.trim());
            }
            
            // Build social object
            
            profileFields.social = {}
            if (youtube) profileFields.social.youtube = youtube;
            if (twiiter) profileFields.social.twiiter = twiiter;
            if (facebook) profileFields.social.facebook = facebook;
            if (linkedin) profileFields.social.linkedin = linkedin;
            if (instagram) profileFields.social.instagram = instagram;
            
            try {
                let profile = await Profile.findOne({user: req.user.id});
                
                if(profile){
                     profile = await Profile.findOneAndUpdate(
                                             {user:req.user.id},
                                             {$set: profileFields},
                                             {new : true}
                     );
                     return res.json(profile);
                }
                   
                //Create

            profile = new Profile(profileFields);
            await profile.save();
            res.json(profile);
                
            }
            catch(err)
            {
               // console.error(err.message);        
                res.status(500).send('Server Error');
            }

            });

    //view the profile        
    router.get('/',async (req,res) =>{

                try
                {
                    const profile = await Profile.find().populate('user',['name','avatar']);
                     
                    if(!profile)
                    {
                       return res.status(400).json({msg:"profile not found"});
                    }

                    res.json(profile);
                }
                catch(err)
                {
                    console.error(err.message);
                    res.status(500).send("Server Error");
                }
           });


    // get profile by user id       
    router.get('/user/:user_ID', async(req,res)=>{
                              
                        try
                        {
                            const profile = await Profile.findOne({user:req.params.user_ID}).populate('user',['name','avatar']);
                            
                            if(!profile)
                            {
                               return res.status(400).json({msg:"profile not found"});
                            }
                            
                            
                            res.json(profile);
                        }
                        catch(err)
                        {
                            console.error(err.message);
                            res.status(500).send("Server Error");
                        }
    });
    

    // delete the profile
    router.delete('/',auth, async (req,res)=>{
                    
                     try
                     {
                         await Post.deleteMany({user: req.user.id});
                         const profile = await Profile.findOneAndRemove({user:req.user.id});
                         const user = await User.findOneAndRemove({_id:req.user.id});
                         res.json({msg:"profile and users are deleted"});

                     }
                     catch(err)
                     {
                         console.error(err.message);
                         
                     }
    });

    //add profile experience
    // private access

    router.put('/experience',
                 [ 
                   auth,
                   [ check('title','title is required').not().isEmpty(),
                     check('company','Company is required').not().isEmpty(),
                     check('from','From date is required').not().isEmpty()         
                    ]
                  ], 
                  async ( req, res) => {
                     const errors = validationResult(req);
                     if(!errors.isEmpty())
                     {
                         return res.status(400).json( {errors:errors.array() });
                     }
                     const {
                         title,
                         company,
                         location,
                         from ,
                         to,
                         current,
                         description
                     } = req.body;
                     

                     const newExp = {
                         title,
                         company,
                         location,
                         from,
                         to,
                         current,
                         description
                     }

                     try 
                     {
                        const profile = await Profile.findOne({user:req.user.id});
                        
                        profile.experience.unshift(newExp);
                        await profile.save(); 

                         res.json(profile);
                     }
                     catch(err)
                     {
                         console.error(err.message);
                         res.status(500).send('Server Error');
                     }

    });

    //delete experience from the profile
    //private

    router.delete('/experience/:exp_id',auth , async(req,res)=>{
               
        try
        {
             const profile = await Profile.findOne({user:req.user.id});

             //get remove index
             const removedIndex =  profile.experience.map(item => item.id).indexOf(req.params.exp_id);

             //remove the index
             profile.experience.splice(removedIndex,1);
             
             await profile.save();

             res.json(profile);

        }
        catch(err)
        {
            console.err(err.message);
            res.status(500).send("Server Error");
        }


    })

    // add school 

     router.put('/education',
                 [ 
                   auth,
                   [ check('school','school is required').not().isEmpty(),
                     check('degree','degree is required').not().isEmpty(),
                     check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
                     check('from','From date is required').not().isEmpty()         
                    ]
                  ], 
                  async ( req, res) => {
                     const errors = validationResult(req);
                     if(!errors.isEmpty())
                     {
                         return res.status(400).json( {errors:errors.array() });
                     }
                     const {
                         school,
                         degree,
                         fieldofstudy,
                         from ,
                         to,
                         current,
                         description
                     } = req.body;
                     

                     const newEdu = {
                         school,
                         degree,
                         fieldofstudy,
                         from,
                         to,
                         current,
                         description
                     }

                     try 
                     {
                        const profile = await Profile.findOne({user:req.user.id});
                        
                        profile.education.unshift(newEdu);
                        await profile.save(); 

                         res.json(profile);
                     }
                     catch(err)
                     {
                         console.error(err.message);
                         res.status(500).send('Server Error');
                     }

    });
    
    // delete school
    router.delete('/education/:edu_id',auth , async(req,res)=>{       
        try
        {
             const profile = await Profile.findOne({user:req.user.id});

             //get remove index
             const removedIndex =  profile.education.map(item => item.id).indexOf(req.params.edu_id);

             //remove the index
             profile.education.splice(removedIndex,1);
             
             await profile.save();

             res.json(profile);

        }
        catch(err)
        {
            console.error(err.message);
            res.status(500).send("Server Error");
        }
    })

    router.get('/github/:username',async(req,res) =>{
        try
        {
            const options = {
                  uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5 & sort=created:asc
                  &client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
                  method:'GET',
                  headers:{'user-agent':'node.js'}
            };
            request(options,(errors,response,body)=>{
                if(errors) console.error(error);

                if(response.statusCode!==200)
                {
                    res.status(400).send('no github profile found');
                }

               res.json(JSON.parse(body)); 
            
            });
        }
        catch(err)
        {
            console.error(err.message);
            res.status(500).send("Server Error");
        }

        
    });



module.exports=router;